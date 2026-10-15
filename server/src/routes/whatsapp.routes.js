
import express from "express";
import rateLimit from "express-rate-limit";
import {
    optInCustomer,
} from "../controllers/whatsapp.controller.js";

const router = express.Router();

const whatsappOptInLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: "Too many WhatsApp opt-in requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/opt-in", whatsappOptInLimiter, optInCustomer);

export default router;