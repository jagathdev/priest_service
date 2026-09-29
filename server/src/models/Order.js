import mongoose from "mongoose";

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
        pooja: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pooja",
            required: true,
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
            basePrice: {
                type: Number,
                required: true,
            },

            extraParticipantCount: {
                type: Number,
                default: 0,
            },

            extraParticipantAmount: {
                type: Number,
                default: 0,
            },

            convenienceFee: {
                type: Number,
                default: 0,
            },

            panditFee: {
                type: Number,
                default: 0,
            },

            recordingFee: {
                type: Number,
                default: 0,
            },

            total: {
                type: Number,
                required: true,
            },

            currency: {
                type: String,
                default: "INR",
            },
        },

        bookingDate: {
            type: Date,
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
            ],
            default: "pending",
        },

        orderStatus: {
            type: String,
            enum: [
                "created",
                "confirmed",
                "completed",
                "cancelled",
            ],
            default: "created",
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;