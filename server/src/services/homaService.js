import Homa from "../models/homaModel.js";

/**
 * Service layer for Homa CRUD database operations.
 */

// 1. Create a new Homa document
export const createHomaService = async (homaData) => {
  const homa = await Homa.create(homaData);
  return homa;
};

// 2. Fetch all Homas sorted by newest first
export const getAllHomasService = async () => {
  const homas = await Homa.find({}).sort({ createdAt: -1 });
  return homas;
};

// 3. Fetch a single Homa by MongoDB _id
export const getHomaByIdService = async (id) => {
  const homa = await Homa.findById(id);
  return homa;
};

// 4. Update an existing Homa by _id
export const updateHomaService = async (id, updateData) => {
  const updatedHoma = await Homa.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });
  return updatedHoma;
};

// 5. Delete a Homa by _id
export const deleteHomaService = async (id) => {
  const deletedHoma = await Homa.findByIdAndDelete(id);
  return deletedHoma;
};
