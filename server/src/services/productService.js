import Product from "../models/productModel.js";

/**
 * Service layer for Product CRUD operations.
 * Handles direct interactions with the Product Mongoose model.
 */

// 1. Create a new product in MongoDB
export const createProductService = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

// 2. Fetch all products from MongoDB
export const getAllProductsService = async () => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  return products;
};

// 3. Fetch a single product by its MongoDB _id
export const getProductByIdService = async (id) => {
  const product = await Product.findById(id);
  return product;
};

// 4. Update an existing product by _id
export const updateProductService = async (id, updateData) => {
  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true, // Return the updated document instead of the original
    runValidators: true, // Run schema validations on the updated fields
  });
  return updatedProduct;
};

// 5. Delete a product by _id
export const deleteProductService = async (id) => {
  const deletedProduct = await Product.findByIdAndDelete(id);
  return deletedProduct;
};
