import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance = null;

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
        amount: Math.round(amount * 100),
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
    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

    return generatedSignature === razorpaySignature;
};