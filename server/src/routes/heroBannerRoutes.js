import express from "express";

import {
    getHeroBanners,
    getHeroBannerById,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
} from "../controllers/heroBanner.Controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public GET
router.get("/", getHeroBanners);
router.get("/:id", getHeroBannerById);

// Admin only
router.post("/", requireAuth, requireAdmin, createHeroBanner);
router.put("/:id", requireAuth, requireAdmin, updateHeroBanner);
router.delete("/:id", requireAuth, requireAdmin, deleteHeroBanner);

export default router;