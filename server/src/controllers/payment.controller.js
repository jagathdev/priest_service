import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.service.js";
import crypto from "crypto";
import Order from "../models/Order.js";

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

        const customUniqueId = `TXN_${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

        const orderReceipt = receipt ? String(receipt) : customUniqueId;

        const razorpayOrder =
            await createRazorpayOrder({
                amount: Number(finalAmount),
                receipt: orderReceipt,
                notes: {
                    uniqueId: customUniqueId,
                },
            });

        return res.status(200).json({
            success: true,
            message: "Payment order created successfully",

            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                notes: razorpayOrder.notes,

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

        let savedOrder = null;
        if (req.body.orderDetails) {
            try {
                savedOrder = await Order.create({
                    ...req.body.orderDetails,
                    bookingDate: new Date(),
                    paymentStatus: "paid",
                    orderStatus: "confirmed",
                    paymentDetails: {
                        transactionId: razorpayPaymentId,
                        paymentMethod: "Razorpay",
                        paymentDate: new Date(),
                        gatewayResponse: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
                    }
                });
                console.log("SUCCESS: Order saved to DB successfully with ID:", savedOrder._id);
            } catch (err) {
                console.error("ERROR: Failed to save order to DB. Reason:", err.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                razorpayOrderId,
                razorpayPaymentId,
                orderId: savedOrder ? savedOrder._id : null
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

export const razorpayWebhookResponse = async (req, res) => {
    try {
        const { razorpayres } = req.body;

        if (!razorpayres) {
            return res.status(400).json({
                success: false,
                message: "razorpayres is required",
            });
        }

        let razorpayData = razorpayres;

        // If Razorpay response was sent as a JSON string
        if (typeof razorpayres === "string") {
            try {
                razorpayData = JSON.parse(razorpayres);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message:
                        "razorpayres must contain valid JSON",
                });
            }
        }

        console.log(
            "Razorpay Webhook Response:",
            JSON.stringify(
                razorpayData,
                null,
                2
            )
        );

        return res.status(200).json({
            success: true,
            message:
                "Razorpay webhook response received",
            data: razorpayData,
        });
    } catch (error) {
        console.error(
            "Razorpay Webhook Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to process Razorpay webhook response",
        });
    }
};