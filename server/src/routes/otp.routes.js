import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import {
    otpSendLimiter,
    otpSendPerMobileLimiter,
    otpVerifyLimiter,
    otpVerifyPerMobileLimiter
} from "../middlewares/rateLimiters.js";
import { validateRequest } from "../middlewares/validate.js";
import { validateSendOtp, validateVerifyOtp } from "../validators/public.schemas.js";

const router = express.Router();

router.post("/sendOtp", otpSendLimiter, otpSendPerMobileLimiter, validateRequest(validateSendOtp), sendOtp);
router.post("/verifyOtp", otpVerifyLimiter, otpVerifyPerMobileLimiter, validateRequest(validateVerifyOtp), verifyOtp);

export default router;