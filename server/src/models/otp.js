import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        resendAvailableAt: {
            type: Date,
            required: true,
        },

        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;