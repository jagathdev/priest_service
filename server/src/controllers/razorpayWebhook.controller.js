import crypto from "crypto";
import WebhookEvent from "../models/WebhookEvent.js";
import Payment from "../models/Payment.js";
import { mapRazorpayPayment } from "../services/paymentMapper.js";
import { markOrderPaid } from "../services/orderPayment.service.js";

/**
 * Handles incoming Razorpay webhooks.
 * Route: POST /api/payments/getRazorpayWebhook
 */
export const getRazorpayWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const eventId = req.headers["x-razorpay-event-id"];
    const rawBody = req.body;

    // 1. Validate required headers and raw buffer body
    if (!signature || !eventId || !rawBody || !Buffer.isBuffer(rawBody)) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid webhook signature, event id, or raw body",
        });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
        console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
        return res.status(500).json({
            success: false,
            message: "Webhook secret is not configured",
        });
    }

    // 2. Compute HMAC-SHA256 and verify with crypto.timingSafeEqual
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");

    if (
        expectedBuf.length !== signatureBuf.length ||
        !crypto.timingSafeEqual(expectedBuf, signatureBuf)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid webhook signature",
        });
    }

    // 3. Parse JSON body
    let body;
    try {
        body = JSON.parse(rawBody.toString("utf8"));
    } catch (parseErr) {
        console.error("[razorpay-webhook] Failed to parse JSON body:", parseErr.message);
        return res.status(400).json({
            success: false,
            message: "Invalid JSON body",
        });
    }

    const eventName = body.event;
    const paymentEntity = body.payload?.payment?.entity;

    // 4. Safe logging: never log email/contact or full payload in production
    const isProduction = process.env.NODE_ENV === "production";
    const safeSummary = {
        event: eventName,
        eventId,
        paymentId: paymentEntity?.id,
        orderId: paymentEntity?.order_id,
        amount: paymentEntity?.amount,
        currency: paymentEntity?.currency,
        status: paymentEntity?.status,
        method: paymentEntity?.method,
        errorCode: paymentEntity?.error_code || null,
    };
    console.log("[razorpay-webhook] summary:", safeSummary);

    if (!isProduction) {
        console.log("[razorpay-webhook] full payload:", JSON.stringify(body, null, 2));
    }

    // 5. Upsert WebhookEvent by eventId
    let webhookEvent;
    try {
        webhookEvent = await WebhookEvent.findOneAndUpdate(
            { eventId },
            {
                $setOnInsert: {
                    eventId,
                    event: eventName || "unknown",
                    rawBody: rawBody.toString("utf8"),
                    receivedAt: new Date(),
                },
                $inc: { attempts: 1 },
            },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
    } catch (dbErr) {
        console.error("[razorpay-webhook] DB error upserting WebhookEvent:", dbErr.message);
        return res.status(500).json({
            success: false,
            message: "Database error recording webhook event",
        });
    }

    // De-duplication: if already processed, return 200 immediately
    if (webhookEvent.status === "processed") {
        console.log(`[razorpay-webhook] Duplicate event ignored (already processed): ${eventId}`);
        return res.status(200).json({
            success: true,
            message: "Duplicate event already processed",
        });
    }

    // Handle unknown / unhandled events
    const supportedEvents = ["payment.captured", "payment.failed", "order.paid"];
    if (!supportedEvents.includes(eventName)) {
        console.log(`[razorpay-webhook] Unhandled event ignored: ${eventName}`);
        webhookEvent.status = "ignored";
        await webhookEvent.save().catch((err) =>
            console.error("[razorpay-webhook] Failed to mark event ignored:", err.message)
        );
        return res.status(200).json({
            success: true,
            message: "Event ignored",
        });
    }

    // 6. Process supported payment event: upsert Payment model
    try {
        if (paymentEntity) {
            const mappedPayment = mapRazorpayPayment(paymentEntity, eventId);

            // Out-of-order safety: if current payment in DB is already 'captured',
            // never downgrade to 'failed' or 'authorized' if an older late event arrives.
            const existingPayment = await Payment.findOne({
                razorpayPaymentId: mappedPayment.razorpayPaymentId,
            });

            if (existingPayment && existingPayment.status === "captured" && mappedPayment.status !== "captured") {
                console.log(
                    `[razorpay-webhook] Preventing status downgrade: payment ${mappedPayment.razorpayPaymentId} is already captured; ignoring status '${mappedPayment.status}' from older event.`
                );
                delete mappedPayment.status;
            }

            await Payment.findOneAndUpdate(
                { razorpayPaymentId: mappedPayment.razorpayPaymentId },
                { $set: mappedPayment },
                { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
            );

            // For payment.captured or order.paid, finalize order
            if (eventName === "payment.captured" || eventName === "order.paid") {
                const markResult = await markOrderPaid({ payment: paymentEntity });
                console.log(
                    `[razorpay-webhook] markOrderPaid result status: ${markResult.status} for order: ${markResult.order?._id || "none"}`
                );
            } else if (eventName === "payment.failed") {
                console.log(
                    `[razorpay-webhook] Payment ${paymentEntity.id} failed; order remains pending for customer retry.`
                );
            }
        }

        // Mark WebhookEvent as processed
        webhookEvent.status = "processed";
        webhookEvent.processedAt = new Date();
        webhookEvent.error = null;
        await webhookEvent.save();

        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully",
        });
    } catch (err) {
        console.error("[razorpay-webhook] Error processing webhook data:", err.message);
        // On any DB/processing error mark the event failed and return 500 so Razorpay retries
        webhookEvent.status = "failed";
        webhookEvent.error = err.message;
        await webhookEvent.save().catch((saveErr) =>
            console.error("[razorpay-webhook] Failed to mark event failed:", saveErr.message)
        );

        return res.status(500).json({
            success: false,
            message: "Internal error processing webhook",
        });
    }
};