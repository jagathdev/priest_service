import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance = null;

export function getRazorpay() {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
            key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
        });
    }
    return razorpayInstance;
}

// ==========================================
// CREATE RAZORPAY ORDER (amountInPaise must be integer paise)
// ==========================================
export const createRazorpayOrder = async ({
    amountInPaise,
    receipt,
    notes = {},
}) => {
    const order = await getRazorpay().orders.create({
        amount: Math.round(amountInPaise),
        currency: process.env.RAZORPAY_CURRENCY || "INR",
        receipt,
        notes,
    });

    return order;
};

// ==========================================
// VERIFY RAZORPAY PAYMENT (timing-safe check)
// ==========================================
export const verifyRazorpayPayment = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return false;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    try {
        const sigA = Buffer.from(generatedSignature, "utf8");
        const sigB = Buffer.from(razorpaySignature, "utf8");
        if (sigA.length !== sigB.length) {
            return false;
        }
        return crypto.timingSafeEqual(sigA, sigB);
    } catch {
        return false;
    }
};

// VERIFY RAZORPAY WEBHOOK SIGNATURE (timing-safe check)

export const verifyWebhookSignature = ({
    rawBody,
    signature,
    secret,
}) => {
    if (!rawBody || !signature || !secret) {
        return false;
    }

    const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    try {
        const sigA = Buffer.from(generatedSignature, "utf8");
        const sigB = Buffer.from(signature, "utf8");
        if (sigA.length !== sigB.length) {
            return false;
        }
        return crypto.timingSafeEqual(sigA, sigB);
    } catch {
        return false;
    }
};