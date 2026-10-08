import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
    {
        tagLine: {
            type: String,
            required: true,
            trim: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        cta: {
            text: {
                type: String,
                required: true,
                trim: true,
            },

            url: {
                type: String,
                required: true,
                trim: true,
            },
        },

        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        displayOrder: {
            type: Number,
            default: 0,
        },

        eventDateTime: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "",
        },

        templeVenue: {
            type: String,
            default: "",
        },

        eventDateText: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const HeroBanner = mongoose.model(
    "HeroBanner",
    heroBannerSchema
);

export default HeroBanner;