import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.service.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const {
            amount,
            receipt,
        } = req.body;

        // VALIDATION

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        const orderReceipt =
            receipt ||
            `receipt_${Date.now()}`;

        // CREATE RAZORPAY ORDER

        const razorpayOrder =
            await createRazorpayOrder({
                amount: Number(amount),
                receipt: orderReceipt,
            });

        return res.status(200).json({
            success: true,
            message: "Payment order created successfully",

            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,

                keyId: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error(
            "Create Payment Order Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
};


// VERIFY PAYMENT

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment verification details are required",
            });
        }

        const isValid =
            verifyRazorpayPayment({
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        // PAYMENT VERIFIED

        // TODO:
        // Find your local Order here
        // and update paymentStatus = "PAID"

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                razorpayOrderId,
                razorpayPaymentId,
            },
        });
    } catch (error) {
        console.error(
            "Verify Payment Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};