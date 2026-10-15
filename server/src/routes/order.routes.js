import express from "express";
import rateLimit from "express-rate-limit";
import { previewOrder, getUserOrders, getOrderStatus } from "../controllers/order.controller.js";
import { requireAuth, requireUserOrAdmin } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { validatePreviewOrder } from "../validators/public.schemas.js";

const router = express.Router();

const statusLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // allow polling every second per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many status requests, please try again shortly." },
});

router.get("/status", statusLimiter, getOrderStatus);
router.post("/preview", validateRequest(validatePreviewOrder), previewOrder);
router.get("/user/:userId", requireAuth, requireUserOrAdmin, getUserOrders);

export default router;