import express from "express";
import { getAdminStats, adminLogin, getAdminOrders, getAdminPayments, updateAdminOrder, bulkScheduleOrders } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/stats", getAdminStats);
router.get("/orders", getAdminOrders);
router.post("/orders/bulk-schedule", bulkScheduleOrders);
router.put("/orders/:id", updateAdminOrder);
router.get("/payments", getAdminPayments);

export default router;
