import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

/**
 * Product REST API Routes
 * Base Path: /api/products
 */

// 1. POST /api/products - Create a product
router.post("/", createProduct);

// 2. GET /api/products - Get all products
router.get("/", getAllProducts);

// 3. GET /api/products/:id - Get product by ID
router.get("/:id", getProductById);

// 4. PUT /api/products/:id - Update product by ID
router.put("/:id", updateProduct);

// 5. DELETE /api/products/:id - Delete product by ID
router.delete("/:id", deleteProduct);

export default router;
