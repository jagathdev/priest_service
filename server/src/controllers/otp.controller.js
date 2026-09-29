import { sendOTP } from "../services/otp.service.js";
import Otp from "../models/otp.js";

export const sendOtp = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        if (!/^\d{10}$/.test(mobileNumber)) {
            return res.status(400).json({
                success: false,
                message: "Mobile number must be exactly 10 digits",
            });
        }

        const result = await sendOTP(String(mobileNumber));

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: result,
        });
    } catch (error) {
        console.error("OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: error.message,
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;

        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Mobile number and OTP are required",
            });
        }

        const otpRecord = await Otp.findOne({
            mobileNumber: String(mobileNumber),
        });

        // OTP doesn't exist
        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message: "OTP not found. Please request a new OTP.",
            });
        }

        // Already verified
        if (otpRecord.verified) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is already verified.",
            });
        }

        // Check OTP expiry
        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteOne({
                _id: otpRecord._id,
            });

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP.",
            });
        }

        // Check OTP
        if (otpRecord.otp !== String(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        // OTP is correct
        otpRecord.verified = true;

        await otpRecord.save();

        // Delete OTP after successful verification
        await Otp.deleteOne({
            _id: otpRecord._id,
        });

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};