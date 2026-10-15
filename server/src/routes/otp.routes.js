import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { otpLimiter, perMobileOtpLimiter } from "../middlewares/rateLimiters.js";
import { validateRequest } from "../middlewares/validate.js";
import { validateSendOtp, validateVerifyOtp } from "../validators/public.schemas.js";

const router = express.Router();

router.post("/sendOtp", otpLimiter, perMobileOtpLimiter, validateRequest(validateSendOtp), sendOtp);
router.post("/verifyOtp", otpLimiter, perMobileOtpLimiter, validateRequest(validateVerifyOtp), verifyOtp);

export default router;