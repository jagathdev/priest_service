import "dotenv/config";
import axios from "axios";
import WhatsAppConsent from "../models/whatsAppConsent.js";

export const normalizeMobile = (value) => {
    let clean = String(value ?? "").replace(/\D/g, "");
    if (clean.length === 11 && clean.startsWith("0")) {
        clean = clean.slice(1);
    }
    // If standard 10-digit number, prepend 91
    if (clean.length === 10) {
        clean = `91${clean}`;
    }
    return clean;
};

const getConfig = () => {
    const config = {
        token: process.env.WHATSAPP_API_TOKEN,
        messageUrl: process.env.WHATSAPP_API_URL,
        optInUrl: process.env.WHATSAPP_OPTIN_URL,
        source: process.env.WHATSAPP_SOURCE,
        template: process.env.NETCORE_ORDER_TEMPLATE || "zoomlink",
    };

    const missing = Object.entries(config)
        .filter(([key, value]) => key !== "template" && !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(
            `Missing WhatsApp environment variables: ${missing.join(", ")}`
        );
    }

    return config;
};

const postToNetcore = async (url, payload, timeoutMs = 10000) => {
    const { token } = getConfig();

    const response = await axios.post(url, payload, {
        headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        timeout: timeoutMs,
    });

    return response.data;
};

const validateMobile = (number) => {
    const mobile = normalizeMobile(number);

    if (!/^[1-9]\d{5,14}$/.test(mobile)) {
        throw new Error("Provide a valid mobile number with country code");
    }

    return mobile;
};

// Register opt-in only after the customer explicitly agrees.
export const registerWhatsAppOptIn = async ({
    mobileNumber,
    consent,
    source = "WEB",
    userAgent = "PriestServices",
}) => {
    if (consent !== true) {
        throw new Error("Customer consent is required");
    }

    const mobile = validateMobile(mobileNumber);
    const { optInUrl } = getConfig();

    const existing = await WhatsAppConsent.findOne({
        mobileNumber: mobile,
        optedIn: true,
    });

    if (existing) {
        return {
            success: true,
            alreadyOptedIn: true,
            mobileNumber: mobile,
        };
    }

    let result;

    try {
        result = await postToNetcore(optInUrl, {
            type: "optin",
            recipients: [
                {
                    recipient: mobile,
                    source,
                    user_agent: userAgent,
                },
            ],
        }, 8000);
    } catch (error) {
        console.error(
            "Netcore opt-in request failed:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.error?.message ||
            "Netcore opt-in request failed"
        );
    }

    const status = String(result?.status || "").toLowerCase();
    const errorCode = String(result?.error?.code || "");
    const errorMessage = String(result?.error?.message || "");

    const alreadyExists =
        status === "failure" &&
        errorCode === "8005" &&
        /optin already found/i.test(errorMessage);

    if (status !== "success" && !alreadyExists) {
        throw new Error(
            errorMessage || "Netcore did not confirm opt-in"
        );
    }

    // Record locally after provider success or a confirmed existing
    // opt-in response, provided customer consent was explicitly obtained.
    await WhatsAppConsent.findOneAndUpdate(
        { mobileNumber: mobile },
        {
            $set: {
                mobileNumber: mobile,
                optedIn: true,
                consentedAt: new Date(),
                source,
            },
        },
        {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
        }
    );

    return {
        success: true,
        alreadyOptedIn: alreadyExists,
        mobileNumber: mobile,
    };
};

// Send the approved zoomlink template.
export const sendOrderConfirmation = async ({
    mobileNumber,
    orderId,
    customerName,
    serviceName,
    bookingDate,
    amount,
}) => {
    const mobile = validateMobile(mobileNumber);

    if (!orderId) {
        throw new Error("Order ID is required");
    }

    const { messageUrl, source, template } = getConfig();

    // Ensure opt-in asynchronously in the background so it does not block immediate message sending
    WhatsAppConsent.findOne({ mobileNumber: mobile, optedIn: true })
        .then((consent) => {
            if (!consent) {
                return registerWhatsAppOptIn({
                    mobileNumber: mobile,
                    consent: true,
                    source: "WEB",
                    userAgent: "PriestServices",
                }).catch((optInErr) => {
                    console.warn("[WhatsApp] Background opt-in notice:", optInErr.message);
                    return WhatsAppConsent.findOneAndUpdate(
                        { mobileNumber: mobile },
                        {
                            $set: {
                                mobileNumber: mobile,
                                optedIn: true,
                                consentedAt: new Date(),
                                source: "WEB",
                            },
                        },
                        { upsert: true }
                    );
                });
            }
        })
        .catch((err) => {
            console.warn("[WhatsApp] Opt-in lookup check notice:", err.message);
        });

    const payload = {
        message: [
            {
                recipient_whatsapp: mobile,
                recipient_type: "individual",
                message_type: "media_template",
                source,
                type_template: [
                    {
                        name: template,
                        attributes: ["AstroVed", String(orderId)],
                        language: {
                            locale: "en",
                            policy: "deterministic",
                        },
                    },
                ],
            },
        ],
    };

    try {
        const result = await postToNetcore(messageUrl, payload);

        // console.log(
        //     "Netcore order confirmation:",
        //     JSON.stringify(result, null, 2)
        // );

        if (String(result?.status || "").toLowerCase() !== "success") {
            throw new Error(
                result?.message || "Netcore rejected the message request"
            );
        }

        return {
            accepted: true,
            messageId: result?.data?.id || null,
            providerResponse: result,
        };
    } catch (error) {
        console.error(
            "WhatsApp order confirmation failed:",
            error.response?.data || error.message
        );

        throw new Error(
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message ||
            "WhatsApp order confirmation failed"
        );
    }
};
