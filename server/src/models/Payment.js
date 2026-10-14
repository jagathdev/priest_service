import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        razorpayPaymentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        razorpayOrderId: {
            type: String,
            required: true,
            index: true, // indexed but NOT unique
        },
        uniqueId: {
            type: String,
            index: true,
        },
        amount: {
            type: Number,
            required: true, // in paise
        },
        currency: {
            type: String,
            default: "INR",
        },
        status: {
            type: String,
            required: true,
        },
        method: {
            type: String,
        },
        cardLast4: {
            type: String,
        },
        cardNetwork: {
            type: String,
        },
        cardType: {
            type: String,
        },
        international: {
            type: Boolean,
            default: false,
        },
        fee: {
            type: Number,
        },
        tax: {
            type: Number,
        },
        authCode: {
            type: String,
        },
        rrn: {
            type: String,
        },
        errorCode: {
            type: String,
            default: null,
        },
        errorDescription: {
            type: String,
            default: null,
        },
        errorSource: {
            type: String,
            default: null,
        },
        errorStep: {
            type: String,
            default: null,
        },
        errorReason: {
            type: String,
            default: null,
        },
        paidAtRazorpay: {
            type: Date,
        },
        email: {
            type: String,
        },
        contact: {
            type: String,
        },
        lastEventId: {
            type: String,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: false, // optional
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Payment", paymentSchema);
