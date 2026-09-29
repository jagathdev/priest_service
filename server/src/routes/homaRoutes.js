import express from "express";
import {
  createHoma,
  getAllHomas,
  getHomaById,
  updateHoma,
  deleteHoma,
} from "../controllers/homaController.js";

const router = express.Router();

/**
 * Homa REST API Routes
 * Base Path: /api/homas
 */

// 1. POST /api/homas - Create a Homa
router.post("/", createHoma);

// 2. GET /api/homas - Get all Homas
router.get("/", getAllHomas);

// 3. GET /api/homas/:id - Get Homa by ID
router.get("/:id", getHomaById);

// 4. PUT /api/homas/:id - Update Homa by ID
router.put("/:id", updateHoma);

// 5. DELETE /api/homas/:id - Delete Homa by ID
router.delete("/:id", deleteHoma);

export default router;
