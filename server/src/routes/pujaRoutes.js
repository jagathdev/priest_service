import express from "express";
import {
  createPuja,
  getAllPujas,
  getPujaById,
  updatePuja,
  deletePuja,
} from "../controllers/pujaController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public GET
router.get("/", getAllPujas);
router.get("/:id", getPujaById);

// Admin only
router.post("/", requireAuth, requireAdmin, createPuja);
router.put("/:id", requireAuth, requireAdmin, updatePuja);
router.delete("/:id", requireAuth, requireAdmin, deletePuja);

export default router;
