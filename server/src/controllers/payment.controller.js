import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.service.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const {
            amount,
            totalamount,
            receipt,
            customerId,
            shoppingCartId,
            contactDetail,
            // ...other fields sent from frontend
        } = req.body;

        const finalAmount = amount || totalamount;

        // VALIDATION

        if (!finalAmount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        if (Number(finalAmount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than 0",
            });
        }

        // Here you can use the extra details (customerId, shoppingCartId, contactDetail)
        // to save the order details in your MongoDB database before calling Razorpay
        console.log("Order payload received:", { customerId, shoppingCartId, finalAmount, contactDetail });

        const orderReceipt =
            receipt ||
            `receipt_${Date.now()}`;

        // CREATE RAZORPAY ORDER

        const razorpayOrder =
            await createRazorpayOrder({
                amount: Number(finalAmount),
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