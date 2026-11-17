import express from "express";
import { trackVisitor, getVisitorStats } from "../controllers/analytics.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public endpoint: lightweight, called by client on landing
router.post("/track-visitor", trackVisitor);

// Admin-only endpoint: for dashboard metrics
router.get("/visitor-stats", requireAuth, requireAdmin, getVisitorStats);

export default router;

