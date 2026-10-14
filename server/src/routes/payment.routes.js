import express from "express";

import {
    createPaymentOrder,
    razorpayWebhookResponse,
    verifyPayment,
} from "../controllers/payment.controller.js";

import { getRazorpayWebhook } from "../controllers/razorpayWebhook.controller.js";

const router = express.Router();

router.post(
    "/create-order",
    createPaymentOrder
);

router.post(
    "/verify",
    verifyPayment
);

router.post(
    "/webhook-response",
    razorpayWebhookResponse
);

router.post("/getRazorpayWebhook", getRazorpayWebhook);

export default router;