import {
    verifyRazorpayPayment,
    verifyWebhookSignature,
    getRazorpay,
} from "../services/payment.service.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import WebhookEvent from "../models/WebhookEvent.js";
import PromoCode from "../models/PromoCode.js";
import PromoCodeUsage from "../models/PromoCodeUsage.js";
import { sendOrderConfirmation } from "../services/whatsapp.service.js";

/**
 * Atomically record promo code usage if order has a promo code.
 * Safe under concurrency with $inc and unique checks.
 */
async function applyPromoUsageAtomically(order) {
    if (!order.promoCodeId) return;

    try {
        const existingUsage = await PromoCodeUsage.findOne({ orderId: order._id });
        if (existingUsage) return;

        // Check if promo has usage limit and verify atomically
        const promo = await PromoCode.findOneAndUpdate(
            {
                _id: order.promoCodeId,
                $or: [
                    { usageLimit: null },
                    { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
                ],
            },
            { $inc: { usedCount: 1 } },
            { returnDocument: "after" }
        );

        if (promo) {
            await PromoCodeUsage.create({
                promoCodeId: order.promoCodeId,
                userId: order.customer,
                orderId: order._id,
                discountAmount: order.discountAmount || 0,
            });
        }
    } catch (err) {
        console.error("Promo atomic usage record error:", err.message);
    }
}

/**
 * POST /api/payments/verify (requireAuth)
 * Idempotent update from pending; never creates orders.
 * Matches by razorpayOrderId AND customer=req.user.id.
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        const customerId = req.user?.id;
        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
            });
        }

        // Verify cryptographic signature with timingSafeEqual
        const isValid = verifyRazorpayPayment({
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

        // Find existing order by razorpayOrderId AND customer
        const order = await Order.findOne({
            razorpayOrderId,
            customer: customerId,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or unauthorized",
            });
        }

        // Record or update Payment model
        let paymentRecord = await Payment.findOne({ razorpayOrderId });
        if (!paymentRecord) {
            paymentRecord = new Payment({
                order: order._id,
                razorpayOrderId,
                razorpayPaymentId,
                signature: razorpaySignature,
                amount: order.pricing.total,
                status: "captured",
                paidAt: new Date(),
            });
        } else {
            paymentRecord.razorpayPaymentId = razorpayPaymentId;
            paymentRecord.signature = razorpaySignature;
            paymentRecord.status = "captured";
            paymentRecord.paidAt = paymentRecord.paidAt || new Date();
        }
        await paymentRecord.save();

        // Idempotent state transition
        if (order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";
            order.orderStatus = "confirmed";
            order.paymentDetails = {
                transactionId: razorpayPaymentId,
                paymentMethod: "Razorpay",
                paymentDate: new Date(),
            };
            await order.save();

            // Atomically record promo code usage
            await applyPromoUsageAtomically(order);

            // Send WhatsApp confirmation asynchronously
            try {
                sendOrderConfirmation({
                    mobileNumber: order.whatsappNumber || order.mobileNumber,
                    orderId: order.orderNumber,
                    customerName: order.customerName,
                    serviceName: order.snapshot?.title || order.itemName,
                    bookingDate: order.bookingDate,
                    amount: order.pricing?.total,
                }).catch((e) => console.error("[WhatsApp] send failed:", e.message));
            } catch (waErr) {
                console.error("[WhatsApp] error:", waErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
            },
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};

/**
 * POST /api/payments/webhook (public)
 * express.raw mounted before express.json; verify signature with RAZORPAY_WEBHOOK_SECRET;
 * dedupe via WebhookEvent unique eventId; fast 200 response; source of truth.
 */
export const handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            return res.status(400).json({
                success: false,
                message: "Missing signature or webhook secret configuration",
            });
        }

        const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body));

        const isValid = verifyWebhookSignature({
            rawBody,
            signature,
            secret: webhookSecret,
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook signature",
            });
        }

        const payload = typeof req.body === "object" && !Buffer.isBuffer(req.body)
            ? req.body
            : JSON.parse(rawBody);

        const event = payload.event;
        const eventId = payload.event_id || `${event}_${payload.payload?.payment?.entity?.id || ""}_${payload.created_at || Date.now()}`;

        // Dedupe via WebhookEvent unique eventId
        try {
            const webhookRecord = new WebhookEvent({
                eventId,
                event,
                processed: false,
            });
            await webhookRecord.save();
        } catch (duplicateErr) {
            // Already processed this event; respond 200 fast
            if (duplicateErr.code === 11000) {
                return res.status(200).json({ status: "already_processed" });
            }
            throw duplicateErr;
        }

        // Respond fast to Razorpay
        res.status(200).json({ status: "ok" });

        // Process event asynchronously
        try {
            if (event === "payment.captured" || event === "order.paid") {
                const paymentEntity = payload.payload?.payment?.entity;
                const razorpayOrderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;
                const razorpayPaymentId = paymentEntity?.id;

                if (razorpayOrderId) {
                    const order = await Order.findOne({ razorpayOrderId });
                    if (order && order.paymentStatus !== "paid") {
                        order.paymentStatus = "paid";
                        order.orderStatus = "confirmed";
                        order.paymentDetails = {
                            transactionId: razorpayPaymentId,
                            paymentMethod: paymentEntity?.method || "Razorpay",
                            paymentDate: new Date(),
                        };
                        await order.save();

                        await applyPromoUsageAtomically(order);

                        // Update or create payment record
                        await Payment.findOneAndUpdate(
                            { razorpayOrderId },
                            {
                                order: order._id,
                                razorpayOrderId,
                                razorpayPaymentId,
                                amount: paymentEntity?.amount || order.pricing.total,
                                status: "captured",
                                method: paymentEntity?.method,
                                rawEvent: payload,
                                paidAt: new Date(),
                            },
                            { upsert: true }
                        );

                        sendOrderConfirmation({
                            mobileNumber: order.whatsappNumber || order.mobileNumber,
                            orderId: order.orderNumber,
                            customerName: order.customerName,
                            serviceName: order.snapshot?.title || order.itemName,
                            bookingDate: order.bookingDate,
                            amount: order.pricing?.total,
                        }).catch(() => {});
                    }
                }
            } else if (event === "payment.failed") {
                const paymentEntity = payload.payload?.payment?.entity;
                const razorpayOrderId = paymentEntity?.order_id;
                if (razorpayOrderId) {
                    const order = await Order.findOne({ razorpayOrderId });
                    if (order && order.paymentStatus === "pending") {
                        order.paymentStatus = "failed";
                        await order.save();

                        await Payment.findOneAndUpdate(
                            { razorpayOrderId },
                            {
                                order: order._id,
                                razorpayOrderId,
                                razorpayPaymentId: paymentEntity?.id,
                                amount: paymentEntity?.amount || order.pricing.total,
                                status: "failed",
                                rawEvent: payload,
                            },
                            { upsert: true }
                        );
                    }
                }
            } else if (event === "refund.processed") {
                const refundEntity = payload.payload?.refund?.entity;
                const paymentEntity = payload.payload?.payment?.entity;
                const razorpayOrderId = paymentEntity?.order_id;
                if (razorpayOrderId) {
                    const order = await Order.findOne({ razorpayOrderId });
                    if (order) {
                        order.paymentStatus = "refunded";
                        order.orderStatus = "cancelled";
                        await order.save();

                        await Payment.findOneAndUpdate(
                            { razorpayOrderId },
                            {
                                status: "refunded",
                                refundedAmount: refundEntity?.amount || 0,
                                rawEvent: payload,
                            }
                        );
                    }
                }
            }

            await WebhookEvent.updateOne({ eventId }, { processed: true });
        } catch (procErr) {
            console.error("Webhook background processing error:", procErr);
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Webhook handler failed" });
        }
    }
};