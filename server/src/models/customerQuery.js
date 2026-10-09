import mongoose from "mongoose";

const customerQuerySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        mobileNumber: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        bookingId: {
            type: String,
            default: "",
            trim: true,
        },

        subject: {
            type: String,
            required: true,
            enum: [
                "Booking Issue",
                "Puja Video Query",
                "Refund/Cancellation",
                "Other",
            ],
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        consent: {
            type: Boolean,
            required: true,
            default: false,
        },

        status: {
            type: String,
            enum: [
                "OPEN",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED",
            ],
            default: "OPEN",
            index: true,
        },

        adminReply: {
            type: String,
            default: "",
            trim: true,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "customer_queries",
    }
);

const CustomerQuery = mongoose.model(
    "CustomerQuery",
    customerQuerySchema
);

export default CustomerQuery;