import express from "express";
import rateLimit from "express-rate-limit";
import {
    optInCustomer,
    optOutCustomer,
} from "../controllers/whatsapp.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

const whatsappLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    message: { success: false, message: "Too many WhatsApp requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/opt-in", whatsappLimiter, requireAuth, optInCustomer);
router.post("/opt-out", whatsappLimiter, requireAuth, optOutCustomer);

export default router;