import mongoose from "mongoose";
import Counter from "./Counter.js";

const participantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        gotra: {
            type: String,
            default: "",
            trim: true,
        },
        doesNotKnowGotra: {
            type: Boolean,
            default: false,
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
            required: false,
            refPath: 'serviceType'
        },
        serviceType: {
            type: String,
            required: false,
            enum: ['Pooja', 'Homa', 'Puja', 'pooja', 'homa', 'puja', 'POOJA', 'HOMA']
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
            default: "",
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
        offerings: [
            {
                name: { type: String, trim: true },
                priceINR: { type: Number, default: 0 },
                description: { type: String, default: "" },
                imageUrl: { type: String, default: "" },
            },
        ],
        pricing: {
            basePrice: { type: Number, default: 0 },
            extraParticipantCount: { type: Number, default: 0 },
            extraParticipantAmount: { type: Number, default: 0 },
            offeringsAmount: { type: Number, default: 0 },
            convenienceFee: { type: Number, default: 0 },
            panditFee: { type: Number, default: 0 },
            recordingFee: { type: Number, default: 0 },
            total: { type: Number, required: true }, // stored in rupees
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
        uniqueId: {
            type: String,
            index: true,
            sparse: true
        },
        promoCode: { type: String, default: "" },
        promoCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PromoCode",
            default: null,
        },
        originalAmount: { type: Number, default: 0 }, // stored in rupees
        discountAmount: { type: Number, default: 0 }, // stored in rupees
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["created", "confirmed", "scheduled", "performed", "completed", "cancelled", "refunded", "refund"],
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

orderSchema.pre('save', async function () {
    if (this.isNew && !this.orderNumber) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'orderNumber' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        this.orderNumber = `PS-${new Date().getFullYear()}-${String(counter.seq).padStart(6, '0')}`;
    }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;