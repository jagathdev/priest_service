import express from "express";

import {
    createPaymentOrder,
    verifyPayment,
} from "../controllers/payment.controller.js";

import { getRazorpayWebhook } from "../controllers/razorpayWebhook.controller.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post(
    "/create-order",
    requireAuth,
    createPaymentOrder
);

router.post(
    "/verify",
    optionalAuth,
    verifyPayment
);


router.post("/getRazorpayWebhook", getRazorpayWebhook);

export default router;