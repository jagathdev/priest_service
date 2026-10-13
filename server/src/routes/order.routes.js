import express from "express";
import { createOrder, getOrderById, getUserOrders } from "../controllers/order.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/:id", requireAuth, getOrderById);
router.get("/user/:userId", requireAuth, getUserOrders);

export default router;