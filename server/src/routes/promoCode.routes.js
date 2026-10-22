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
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validate.js";
import { validateApplyPromo } from "../validators/public.schemas.js";

const router = express.Router();

// Admin
router.get("/", requireAuth, requireAdmin, getPromoCodes);
router.get("/:id", requireAuth, requireAdmin, getPromoCodeById);
router.post("/", requireAuth, requireAdmin, createPromoCode);
router.put("/:id", requireAuth, requireAdmin, updatePromoCode);
router.delete("/:id", requireAuth, requireAdmin, deletePromoCode);
router.patch("/:id/status", requireAuth, requireAdmin, updatePromoStatus);

// Customer (allows all users / guests to validate & apply promo codes)
router.post("/apply", optionalAuth, validateRequest(validateApplyPromo), applyPromoCode);

export default router;