import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    provider: { type: String, default: 'Razorpay' },
    razorpayOrderId: { type: String, unique: true, required: true },
    razorpayPaymentId: { type: String, sparse: true },
    signature: { type: String },
    amount: { type: Number, required: true }, // paise
    status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
    method: { type: String },
    rawEvent: { type: mongoose.Schema.Types.Mixed },
    paidAt: { type: Date },
    refundedAmount: { type: Number, default: 0 } // paise
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
