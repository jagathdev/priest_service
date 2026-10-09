import express from "express";
import { previewOrder, getUserOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/preview", previewOrder);
router.get("/user/:userId", getUserOrders);

export default router;