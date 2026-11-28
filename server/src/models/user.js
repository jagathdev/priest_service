import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "Home",
            trim: true,
        },
        name: {
            type: String,
            default: "",
            trim: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine2: {
            type: String,
            default: "",
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
        },

        country: {
            type: String,
            default: "India",
            trim: true,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

const userSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        whatsappNumber: {
            type: String,
            default: "",
            trim: true,
        },

        name: {
            type: String,
            default: "",
            trim: true,
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        walletBalance: {
            type: Number,
            default: 0,
            min: 0,
        },

        addresses: {
            type: [addressSchema],
            default: [],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        password: {
            type: String,
            default: "",
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        isLoggedIn: {
            type: Boolean,
            default: false,
            index: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
        sessionExpiresAt: {
            type: Date,
            default: null,
            index: true,
        },
        utmSource: {
            type: String,
            default: "Direct",
            trim: true,
            index: true,
        },
        utmMedium: {
            type: String,
            default: "",
            trim: true,
        },
        utmCampaign: {
            type: String,
            default: "",
            trim: true,
        },
        referrer: {
            type: String,
            default: "",
            trim: true,
        },
        landingPage: {
            type: String,
            default: "",
            trim: true,
        },
        firstVisitedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;