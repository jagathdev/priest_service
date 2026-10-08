import express from "express";
import { getAdminStats, adminLogin, getAdminOrders, getAdminPayments, updateAdminOrder } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/stats", getAdminStats);
router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateAdminOrder);
router.get("/payments", getAdminPayments);

export default router;
