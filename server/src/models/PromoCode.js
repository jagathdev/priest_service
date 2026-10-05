import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["PERCENTAGE", "FIXED"],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        maxDiscount: {
            type: Number,
            default: null,
            min: 0,
        },

        minimumOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        usageLimit: {
            type: Number,
            default: null,
            min: 0,
        },

        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        usageLimitPerUser: {
            type: Number,
            default: 1,
            min: 1,
        },

        applicableServices: {
            type: String,
            enum: ["ALL", "POOJA", "HOMA"],
            default: "ALL",
        },

        applicablePackages: {
            type: [String],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const PromoCode =
    mongoose.models.PromoCode ||
    mongoose.model(
        "PromoCode",
        promoCodeSchema
    );

export default PromoCode;