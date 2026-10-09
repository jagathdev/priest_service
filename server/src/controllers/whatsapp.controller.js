
import {
    registerWhatsAppOptIn,
    sendOrderConfirmation,
} from "../services/whatsapp.service.js";

export const optInCustomer = async (req, res) => {
    try {
        const { mobileNumber, consent } = req.body;

        const result = await registerWhatsAppOptIn({
            mobileNumber,
            consent,
            // source: process.env.WHATSAPP_SOURCE || "WEB",
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

        return res.status(502).json({
            success: false,
            message: error.message || "WhatsApp opt-in failed",
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

        if (
            !mobileNumber ||
            !customerName ||
            !orderId ||
            !serviceName ||
            !bookingDate ||
            amount === undefined ||
            amount === null
        ) {
            return res.status(400).json({
                success: false,
                message: "All order confirmation fields are required",
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