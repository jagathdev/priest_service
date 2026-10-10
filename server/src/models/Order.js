import mongoose from "mongoose";
import Counter from "./Counter.js";

const participantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true
        },
        pooja: {
            type: String,
            trim: true,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'serviceType'
        },
        serviceType: {
            type: String,
            required: true,
            enum: ['Pooja', 'Homa']
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        customerName: {
            type: String,
            trim: true,
        },
        itemName: {
            type: String,
            trim: true,
        },
        mobileNumber: {
            type: String,
            trim: true,
        },
        whatsappNumber: {
            type: String,
            required: true,
            trim: true,
        },
        participants: {
            type: [participantSchema],
            required: true,
            validate: {
                validator: (participants) => participants.length >= 1,
                message: "At least one participant is required",
            },
        },
        gotra: {
            type: String,
            default: "Kashyapa",
            trim: true,
        },
        doesNotKnowGotra: {
            type: Boolean,
            default: false,
        },
        wish: {
            type: String,
            default: "",
            trim: true,
        },
        pricing: {
            basePrice: { type: Number, required: true },
            extraParticipantCount: { type: Number, default: 0 },
            extraParticipantAmount: { type: Number, default: 0 },
            convenienceFee: { type: Number, default: 0 },
            panditFee: { type: Number, default: 0 },
            recordingFee: { type: Number, default: 0 },
            total: { type: Number, required: true }, // stored in integer paise
            currency: { type: String, default: "INR" },
        },
        bookingDate: {
            type: Date,
            required: true,
        },
        paymentDetails: {
            transactionId: { type: String, trim: true },
            paymentMethod: { type: String, trim: true },
            paymentDate: { type: Date },
        },
        razorpayOrderId: {
            type: String,
            unique: true,
            sparse: true
        },
        promoCode: { type: String, default: "" },
        promoCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PromoCode",
            default: null,
        },
        originalAmount: { type: Number, default: 0 }, // stored in integer paise
        discountAmount: { type: Number, default: 0 }, // stored in integer paise
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["created", "confirmed", "scheduled", "performed", "completed", "cancelled"],
            default: "created",
        },
        scheduledDate: { type: Date, default: null },
        videoLink: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ customer: 1, createdAt: -1 });

orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'orderNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.orderNumber = `PS-${new Date().getFullYear()}-${String(counter.seq).padStart(6, '0')}`;
    }
    next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;