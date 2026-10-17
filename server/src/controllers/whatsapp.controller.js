import User from "../models/user.js";
import {
    normalizeMobile,
    registerWhatsAppOptIn,
    registerWhatsAppOptOut,
    sendOrderConfirmation,
} from "../services/whatsapp.service.js";

export const optInCustomer = async (req, res) => {
    try {
        const { mobileNumber, consent } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        // Verify phone ownership for non-admin callers
        if (req.user?.role !== "admin") {
            const user = await User.findById(req.user?.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            const cleanReqMobile = normalizeMobile(mobileNumber);
            const cleanUserMobile = normalizeMobile(user.mobileNumber);
            const cleanUserWhatsapp = normalizeMobile(user.whatsappNumber);

            if (cleanReqMobile !== cleanUserMobile && cleanReqMobile !== cleanUserWhatsapp) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You may only opt-in your own verified account phone number",
                });
            }
        }

        const result = await registerWhatsAppOptIn({
            mobileNumber,
            consent,
            source: "WEB",
            userAgent: req.get("user-agent") || "PriestServices",
        });

        return res.status(200).json({
            success: true,
            message: result.alreadyOptedIn
                ? "Customer is already opted in"
                : "Customer opt-in registered",
            data: result,
        });
    } catch (error) {
        console.error("WhatsApp opt-in error:", error.message);

        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "WhatsApp opt-in failed",
        });
    }
};

export const optOutCustomer = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        // Verify phone ownership for non-admin callers
        if (req.user?.role !== "admin") {
            const user = await User.findById(req.user?.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            const cleanReqMobile = normalizeMobile(mobileNumber);
            const cleanUserMobile = normalizeMobile(user.mobileNumber);
            const cleanUserWhatsapp = normalizeMobile(user.whatsappNumber);

            if (cleanReqMobile !== cleanUserMobile && cleanReqMobile !== cleanUserWhatsapp) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: You may only opt-out your own verified account phone number",
                });
            }
        }

        const result = await registerWhatsAppOptOut({ mobileNumber });

        return res.status(200).json({
            success: true,
            message: "WhatsApp opt-out recorded",
            data: result,
        });
    } catch (error) {
        console.error("WhatsApp opt-out error:", error.message);

        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "WhatsApp opt-out failed",
        });
    }
};

export const confirmCustomerOrder = async (req, res) => {
    try {
        const {
            mobileNumber,
            customerName,
            orderId,
            serviceName,
            bookingDate,
            amount,
        } = req.body;

        if (!mobileNumber || !orderId) {
            return res.status(400).json({
                success: false,
                message: "mobileNumber and orderId are required",
            });
        }

        const result = await sendOrderConfirmation({
            mobileNumber,
            customerName,
            orderId,
            serviceName,
            bookingDate,
            amount,
        });

        return res.status(200).json({
            success: true,
            message: "Confirmation request accepted by Netcore",
            data: result,
        });
    } catch (error) {
        console.error("WhatsApp confirmation error:", error.message);

        return res.status(502).json({
            success: false,
            message: error.message || "WhatsApp confirmation failed",
        });
    }
};