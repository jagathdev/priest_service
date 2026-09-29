import axios from "axios";
import Otp from "../models/otp.js";

const OTP_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (mobileNumber) => {
    const now = new Date();

    // Find existing OTP for this mobile number
    const existingOtp = await Otp.findOne({
        mobileNumber,
    });

    // Check 10-second resend cooldown
    if (
        existingOtp &&
        existingOtp.resendAvailableAt &&
        now < existingOtp.resendAvailableAt
    ) {
        const remainingSeconds = Math.ceil(
            (existingOtp.resendAvailableAt.getTime() - now.getTime()) / 1000
        );

        const error = new Error(
            `Please wait ${remainingSeconds} seconds before requesting another OTP.`
        );

        error.statusCode = 429;
        error.remainingSeconds = remainingSeconds;

        throw error;
    }

    // Generate new OTP
    const otp = generateOTP();

    // OTP expires after 5 minutes
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_TIME);

    // Resend allowed after 10 seconds
    const resendAvailableAt = new Date(now.getTime() + RESEND_COOLDOWN);

    // Save / update OTP
    await Otp.findOneAndUpdate(
        { mobileNumber },
        {
            mobileNumber,
            otp,
            expiresAt,
            resendAvailableAt,
            verified: false,
        },
        {
            upsert: true,
            returnDocument: "after",
        }
    );

    // Create SMS URL
    let url = process.env.OTP_URL;

    if (!url) {
        throw new Error("OTP_URL is not configured in .env");
    }

    url = url.replace("{usermobilenumber}", mobileNumber);
    url = url.replace("{randomotp}", otp);

    // Send SMS
    const response = await axios.get(url);

    return {
        otpSent: true,
        expiresIn: 300,
        resendAfter: 10,
        smsResponse: response.data,
    };
};