import express from "express";

import {
    createPaymentOrder,
    verifyPayment,
} from "../controllers/payment.controller.js";

import { getRazorpayWebhook } from "../controllers/razorpayWebhook.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post(
    "/create-order",
    requireAuth,
    createPaymentOrder
);

router.post(
    "/verify",
    requireAuth,
    verifyPayment
);

router.post("/getRazorpayWebhook", getRazorpayWebhook);

export default router;