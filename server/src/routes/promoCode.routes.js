import express from "express";

import {
    createPromoCode,
    getPromoCodes,
    getPromoCodeById,
    updatePromoCode,
    deletePromoCode,
    updatePromoStatus,
    applyPromoCode,
} from "../controllers/promoCode.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Admin
router.get("/", requireAuth, requireAdmin, getPromoCodes);
router.get("/:id", requireAuth, requireAdmin, getPromoCodeById);
router.post("/", requireAuth, requireAdmin, createPromoCode);
router.put("/:id", requireAuth, requireAdmin, updatePromoCode);
router.delete("/:id", requireAuth, requireAdmin, deletePromoCode);
router.patch("/:id/status", requireAuth, requireAdmin, updatePromoStatus);

// Customer
router.post("/apply", requireAuth, applyPromoCode);

export default router;