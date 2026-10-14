import express from "express";
import rateLimit from "express-rate-limit";
import { previewOrder, getUserOrders, getOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

const statusLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // allow polling every second per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many status requests, please try again shortly." },
});

router.get("/status", statusLimiter, getOrderStatus);
router.post("/preview", previewOrder);
router.get("/user/:userId", getUserOrders);

export default router;