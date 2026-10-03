import express from "express";
import { getAdminStats, adminLogin, getAdminOrders, getAdminPayments } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/stats", getAdminStats);
router.get("/orders", getAdminOrders);
router.get("/payments", getAdminPayments);

export default router;
