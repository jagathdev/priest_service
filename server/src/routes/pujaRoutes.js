import express from "express";
import {
  createPuja,
  getAllPujas,
  getPujaById,
  updatePuja,
  deletePuja,
} from "../controllers/pujaController.js";

const router = express.Router();

/**
 * Puja REST API Routes
 * Base Path: /api/pujas
 */

// 1. POST /api/pujas - Create a Puja
router.post("/", createPuja);

// 2. GET /api/pujas - Get all Pujas
router.get("/", getAllPujas);

// 3. GET /api/pujas/:id - Get Puja by ID
router.get("/:id", getPujaById);

// 4. PUT /api/pujas/:id - Update Puja by ID
router.put("/:id", updatePuja);

// 5. DELETE /api/pujas/:id - Delete Puja by ID
router.delete("/:id", deletePuja);

export default router;
