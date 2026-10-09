import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/productService.js";

/**
 * Controller layer for Product REST API endpoints.
 * Handles HTTP requests (req), response formatting (res), and HTTP status codes.
 */

// 1. POST /api/products - Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;

    // Basic request validation
    if (!name || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, price, and category",
      });
    }

    const product = await createProductService(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 2. GET /api/products - Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await getAllProductsService();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 3. GET /api/products/:id - Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 4. PUT /api/products/:id - Update an existing product by ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await updateProductService(id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 5. DELETE /api/products/:id - Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await deleteProductService(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
