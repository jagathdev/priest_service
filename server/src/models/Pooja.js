import mongoose from "mongoose";

const poojaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        image: {
            type: String,
            default: "",
        },

        basePrice: {
            type: Number,
            required: true,
            min: 0,
        },

        pricing: {
            extraParticipant: {
                type: Number,
                default: 300,
                min: 0,
            },

            convenienceFee: {
                type: Number,
                default: 25,
                min: 0,
            },

            panditFee: {
                type: Number,
                default: 150,
                min: 0,
            },

            recordingFee: {
                type: Number,
                default: 500,
                min: 0,
            },
        },

        currency: {
            type: String,
            default: "INR",
        },

        maxParticipants: {
            type: Number,
            default: 10,
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

const Pooja = mongoose.model("Pooja", poojaSchema);

export default Pooja;