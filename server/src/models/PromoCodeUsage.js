import mongoose from "mongoose";

const promoCodeUsageSchema =
    new mongoose.Schema(
        {
            promoCodeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PromoCode",
                required: true,
                index: true,
            },

            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true,
                unique: true,
            },

            discountAmount: {
                type: Number,
                required: true,
                min: 0,
            },
        },
        {
            timestamps: true,
        }
    );

const PromoCodeUsage =
    mongoose.models.PromoCodeUsage ||
    mongoose.model(
        "PromoCodeUsage",
        promoCodeUsageSchema
    );

export default PromoCodeUsage;