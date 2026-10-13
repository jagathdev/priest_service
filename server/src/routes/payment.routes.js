import express from "express";
import { verifyPayment, handleRazorpayWebhook } from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

// Verify payment initiated from checkout
router.post("/verify", requireAuth, verifyPayment);

// Razorpay webhook endpoint (raw body verified in controller)
router.post("/webhook", handleRazorpayWebhook);

export default router;