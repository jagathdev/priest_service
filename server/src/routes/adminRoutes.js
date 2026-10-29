import express from "express";
import {
  getAdminStats,
  adminLogin,
  getAdminOrders,
  getAdminOrderById,
  getAdminPayments,
  updateAdminOrder,
  bulkScheduleOrders,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { loginLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/login", loginLimiter, adminLogin);

router.use(requireAuth, requireAdmin);
router.get("/stats", getAdminStats);
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrderById);
router.post("/orders/bulk-schedule", bulkScheduleOrders);
router.put("/orders/:id", updateAdminOrder);
router.get("/payments", getAdminPayments);
router.get("/users", getAdminUsers);
router.put("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);

export default router;
