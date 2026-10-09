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

const router = express.Router();

//  Admin


router.get("/", getPromoCodes);

router.get("/:id", getPromoCodeById);

router.post("/", createPromoCode);

router.put("/:id", updatePromoCode);

router.delete("/:id", deletePromoCode);

router.patch(
    "/:id/status",
    updatePromoStatus
);

//  Customer

router.post(
    "/apply",
    applyPromoCode
);

export default router;