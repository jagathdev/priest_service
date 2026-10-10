import express from "express";
import {
  createHoma,
  getAllHomas,
  getHomaById,
  updateHoma,
  deleteHoma,
} from "../controllers/homaController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public GET
router.get("/", getAllHomas);
router.get("/:id", getHomaById);

// Admin only
router.post("/", requireAuth, requireAdmin, createHoma);
router.put("/:id", requireAuth, requireAdmin, updateHoma);
router.delete("/:id", requireAuth, requireAdmin, deleteHoma);

export default router;
