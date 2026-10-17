import Razorpay from "razorpay";
import crypto from "crypto";
import { toPaise } from "../utils/currency.js";

let razorpayInstance = null;

export function setRazorpayInstance(mockInstance) {
    razorpayInstance = mockInstance;
}

export function resetRazorpayInstance() {
    razorpayInstance = null;
}

function getRazorpay() {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

export const createRazorpayOrder = async ({
    amount,
    receipt,
    notes,
}) => {
    const order = await getRazorpay().orders.create({
        amount: toPaise(amount),
        currency: process.env.RAZORPAY_CURRENCY || "INR",
        receipt,
        notes,
    });

    return order;
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

export const verifyRazorpayPayment = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return false;
    }

    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

    try {
        const genBuffer = Buffer.from(generatedSignature, "utf8");
        const sigBuffer = Buffer.from(razorpaySignature, "utf8");
        if (genBuffer.length !== sigBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(genBuffer, sigBuffer);
    } catch {
        return false;
    }
};

// ==========================================
// FETCH RAZORPAY PAYMENT
// ==========================================

export const fetchRazorpayPayment = async (paymentId) => {
    if (!paymentId) {
        throw new Error("Payment ID is required to fetch Razorpay payment");
    }
    return await getRazorpay().payments.fetch(paymentId);
};