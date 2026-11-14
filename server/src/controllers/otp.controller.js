import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendOTP } from "../services/otp.service.js";
import Otp from "../models/otp.js";
import User from "../models/user.js";

// ==========================================
// SEND OTP
// ==========================================

export const sendOtp = async (req, res) => {
    try {
        const { mobileNumber } = req.body;

        // Check mobile number
        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        const mobile = String(mobileNumber).trim();

        // Validate Indian 10 digit mobile number
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "Mobile number must be exactly 10 digits",
            });
        }

        // Send OTP
        const result = await sendOTP(mobile);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: result,
        });
    } catch (error) {
        console.error("Send OTP Error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.message || "Failed to send OTP",
        });
    }
};


export const verifyOtp = async (req, res) => {
    try {
        const {
            mobileNumber,
            otp,
            utmSource,
            utmMedium,
            utmCampaign,
        } = req.body;

        // Check required fields
        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Mobile number and OTP are required",
            });
        }

        const mobile = String(mobileNumber).trim();
        const enteredOtp = String(otp).trim();

        // Validate mobile number
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message:
                    "Mobile number must be exactly 10 digits",
            });
        }

        // Validate OTP format
        if (!/^\d{6}$/.test(enteredOtp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must be exactly 6 digits",
            });
        }

        // ==========================================
        // FIND OTP
        // ==========================================

        const otpRecord = await Otp.findOne({
            mobileNumber: mobile,
        });

        // OTP doesn't exist
        if (!otpRecord) {
            return res.status(404).json({
                success: false,
                message:
                    "OTP not found. Please request a new OTP.",
            });
        }

        // ==========================================
        // CHECK OTP EXPIRY
        // ==========================================

        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteOne({
                _id: otpRecord._id,
            });

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please request a new OTP.",
            });
        }

        // ==========================================
        // CONCURRENCY-SAFE ATTEMPT INCREMENT (max 5)
        // ==========================================

        const updatedOtp = await Otp.findOneAndUpdate(
            { _id: otpRecord._id, attempts: { $lt: 5 } },
            { $inc: { attempts: 1 } },
            { returnDocument: "after" }
        );

        if (!updatedOtp || updatedOtp.attempts > 5) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "Maximum OTP verification attempts exceeded. Please request a new OTP.",
            });
        }

        // ==========================================
        // TIMING-SAFE HASH COMPARISON
        // ==========================================

        const enteredOtpHash = crypto.createHash("sha256").update(enteredOtp).digest("hex");
        const storedHash = String(updatedOtp.otp || "");
        let isMatch = false;

        if (storedHash.length === 64) {
            const bufStored = Buffer.from(storedHash, "utf-8");
            const bufEntered = Buffer.from(enteredOtpHash, "utf-8");
            isMatch = crypto.timingSafeEqual(bufStored, bufEntered);
        }

        if (!isMatch) {
            const remainingAttempts = Math.max(0, 5 - updatedOtp.attempts);
            if (remainingAttempts === 0) {
                await Otp.deleteOne({ _id: updatedOtp._id });
                return res.status(400).json({
                    success: false,
                    message: "Maximum OTP verification attempts exceeded. Please request a new OTP.",
                });
            }
            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
            });
        }

        // ==========================================
        // FIND USER
        // ==========================================

        const standardMobile = mobile.startsWith("91") && mobile.length === 12
            ? mobile
            : (mobile.length === 10 ? `91${mobile}` : mobile);

        let user = await User.findOne({
            $or: [
                { mobileNumber: standardMobile },
                { mobileNumber: mobile },
                { mobileNumber: `+91${mobile}` },
                { mobileNumber: `+${standardMobile}` },
            ],
        });

        let isNewUser = false;

        // ==========================================
        // CREATE USER IF NOT EXISTS
        // ==========================================

        if (!user) {
            user = await User.create({
                mobileNumber: standardMobile,
                name: "Devotee",
                email: "",
                role: "user",
                isVerified: true,
                walletBalance: 0,
                addresses: [],
                utmSource: String(utmSource || "Direct").trim(),
                utmMedium: String(utmMedium || "").trim(),
                utmCampaign: String(utmCampaign || "").trim(),
            });

            isNewUser = true;
        } else {
            // Existing user - ensure standard 91 format and verified status
            user.mobileNumber = standardMobile;
            user.isVerified = true;
            if (!user.name || user.name.trim() === "") {
                user.name = "Devotee";
            }
            if (!user.role) {
                user.role = "user";
            }
            if (utmSource && (!user.utmSource || user.utmSource === "Direct")) {
                user.utmSource = String(utmSource).trim();
                if (utmMedium) user.utmMedium = String(utmMedium).trim();
                if (utmCampaign) user.utmCampaign = String(utmCampaign).trim();
            }

            await user.save();
        }

        // ==========================================
        // MARK OTP AS VERIFIED (Do NOT delete so history/counts persist in DB)
        // ==========================================

        await Otp.updateOne(
            { _id: otpRecord._id },
            {
                $set: {
                    verified: true,
                    verifiedAt: new Date(),
                }
            }
        );

        // ==========================================
        // GENERATE AUTH TOKEN & SUCCESS RESPONSE
        // ==========================================

        const token = jwt.sign(
            { id: user._id, role: "user" },
            process.env.JWT_SECRET || "default_jwt_secret",
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
            sameSite: "lax",
        });

        res.cookie("userLogin", "true", {
            httpOnly: false, // Non-sensitive flag for UI hint
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
            sameSite: "lax",
        });

        return res.status(200).json({
            success: true,
            is_user: true,
            message: "Login successful",
            token,
            data: {
                is_user: true,
                token,
                user: {
                    id: user._id,
                    mobileNumber: user.mobileNumber,
                    whatsappNumber: user.whatsappNumber || "",
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                    walletBalance: user.walletBalance,
                    addresses: user.addresses,
                },

                isNewUser,
            },
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};