import crypto from "crypto";
import axios from "axios";
import Otp from "../models/otp.js";

const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN = 60 * 1000; // 60 seconds

export const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

export const hashOtp = (otp) => {
    return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

export const sendOTP = async (mobileNumber) => {
    const now = new Date();

    // Find existing OTP for this mobile number
    const existingOtp = await Otp.findOne({
        mobileNumber,
    });

    // Check resend cooldown
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
    const rawOtp = generateOTP();
    const hashedOtp = hashOtp(rawOtp);

    // OTP expires after 5 minutes
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_TIME);

    // Resend allowed after 60 seconds
    const resendAvailableAt = new Date(now.getTime() + RESEND_COOLDOWN);

    // Save / update OTP with hashed value and reset attempts
    await Otp.findOneAndUpdate(
        { mobileNumber },
        {
            mobileNumber,
            otp: hashedOtp,
            expiresAt,
            resendAvailableAt,
            verified: false,
            attempts: 0,
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
        url = url.replace("{randomotp}", rawOtp);
    } else {
        url = url.replace("is+{}.", `is+${rawOtp}.`);
    }

    // Send SMS request to 24x7sms gateway with timeout and sanitized logging
    try {
        await axios.get(url, { timeout: 8000 });
    } catch (smsError) {
        // Redact URL and credentials from error logs
        console.error("[OTP Service] SMS Gateway dispatch failed:", smsError.code || smsError.message);
        const err = new Error("Unable to deliver SMS verification code. Please try again shortly.");
        err.statusCode = 502;
        throw err;
    }

    return {
        otpSent: true,
        expiresIn: 300, // 5 minutes in seconds
        resendAfter: 60, // 60 seconds
    };
};