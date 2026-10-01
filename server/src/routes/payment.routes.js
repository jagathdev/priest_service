import express from "express";

import {
    createPaymentOrder,
    razorpayWebhookResponse,
    verifyPayment,
} from "../controllers/payment.controller.js";

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

export default router;