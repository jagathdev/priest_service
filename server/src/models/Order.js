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
        orderNumber: {
            type: String,
            unique: true,
            default: () => "ORD" + Date.now() + Math.floor(Math.random() * 1000),
        },

        pooja: {
            type: String,
            trim: true,
            required: false, // Made optional to support homas if needed
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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

        paymentDetails: {
            transactionId: {
                type: String,
                trim: true,
            },
            paymentMethod: {
                type: String,
                trim: true,
            },
            paymentDate: {
                type: Date,
            },
            gatewayResponse: {
                type: mongoose.Schema.Types.Mixed, // Stores the raw response from the payment gateway
            },
        },
        promoCode: {
            type: String,
            default: "",
        },

        promoCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PromoCode",
            default: null,
        },

        originalAmount: {
            type: Number,
            default: 0,
        },

        discountAmount: {
            type: Number,
            default: 0,
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
                "scheduled",
                "performed",
                "completed",
                "cancelled",
            ],
            default: "created",
        },
        scheduledDate: {
            type: Date,
            default: null,
        },
        videoLink: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;