import {
  getAdminPreOrders,
  deleteAdminPreOrder,
  bulkDeleteAdminPreOrders
} from "../controllers/preOrder.controller.js";
import express from "express";
import {
  getAdminStats,
  adminLogin,
  adminLogout,
  getAdminOrders,
  getAdminOrderById,
  getAdminPayments,
  updateAdminOrder,
  bulkScheduleOrders,
  bulkUpdateOrdersStatus,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  bulkSoftDeleteUsers,
  restoreAdminUser,
  bulkRestoreUsers,
  permanentDeleteAdminUser,
  bulkPermanentDeleteUsers
} from "../controllers/adminController.js";
import {
  getAdminCustomerQueries,
  updateAdminCustomerQuery,
  deleteAdminCustomerQuery,
  bulkDeleteAdminCustomerQueries
} from "../controllers/customerQuery.controller.js";
import {
  getDispatchDevotees,
  exportDispatchExcel,
} from "../controllers/serviceDispatch.controller.js";
import {
  getRecipients,
  addRecipient,
  updateRecipient,
  deleteRecipient,
  triggerTestMail,
  resendOrderEmail,
} from "../controllers/notification.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { loginLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/login", loginLimiter, adminLogin);
router.post("/logout", adminLogout);

router.use(requireAuth, requireAdmin);
router.get("/stats", getAdminStats);
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrderById);
router.post("/orders/bulk-schedule", bulkScheduleOrders);
router.post("/orders/bulk-status", bulkUpdateOrdersStatus);
router.put("/orders/:id", updateAdminOrder);
router.post("/orders/:orderId/resend-email", resendOrderEmail);
router.get("/payments", getAdminPayments);

// Email Notification Settings & Multi-Recipients
router.get("/notifications/recipients", getRecipients);
router.post("/notifications/recipients", addRecipient);
router.put("/notifications/recipients/:id", updateRecipient);
router.delete("/notifications/recipients/:id", deleteRecipient);
router.post("/notifications/test-mail", triggerTestMail);

// Pre-Orders / Incomplete Booking Leads
router.get("/pre-orders", getAdminPreOrders);
router.post("/pre-orders/bulk-delete", bulkDeleteAdminPreOrders);
router.delete("/pre-orders/:id", deleteAdminPreOrder);

// Customer Queries / Help Requests
router.get("/customer-queries", getAdminCustomerQueries);
router.put("/customer-queries/:id", updateAdminCustomerQuery);
router.delete("/customer-queries/:id", deleteAdminCustomerQuery);
router.post("/customer-queries/bulk-delete", bulkDeleteAdminCustomerQueries);

// Service Team Dispatch & Priest Excel Export
router.get("/service-dispatch", getDispatchDevotees);
router.get("/service-dispatch/export", exportDispatchExcel);

// User routes & bulk/trash operations
router.get("/users", getAdminUsers);
router.post("/users/bulk-delete", bulkSoftDeleteUsers);
router.post("/users/bulk-restore", bulkRestoreUsers);
router.post("/users/bulk-permanent-delete", bulkPermanentDeleteUsers);
router.put("/users/:id/restore", restoreAdminUser);
router.delete("/users/:id/permanent", permanentDeleteAdminUser);
router.put("/users/:id", updateAdminUser);
router.delete("/users/:id", deleteAdminUser);

export default router;
