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

    // Standardize phone number with 91 country code prefix for 24x7sms
    const formattedPhone = mobileNumber.startsWith("91") && mobileNumber.length === 12
        ? mobileNumber
        : `91${mobileNumber.replace(/\D/g, "")}`;

    if (url.includes("{usermobilenumber}")) {
        url = url.replace("{usermobilenumber}", formattedPhone);
    } else {
        url = url.replace("MobileNo={}", `MobileNo=${formattedPhone}`);
    }

    if (url.includes("{randomotp}")) {
        url = url.replace("{randomotp}", otp);
    } else {
        url = url.replace("is+{}.", `is+${otp}.`);
    }

    // Send SMS request to 24x7sms gateway
    const response = await axios.get(url);
    console.log(`[sendOTP] Sent to ${formattedPhone}, SMS Gateway Response:`, response.data);

    return {
        otpSent: true,
        expiresIn: 300,
        resendAfter: 10,
        smsResponse: response.data,
    };
};