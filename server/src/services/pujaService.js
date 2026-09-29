import Puja from "../models/pujaModel.js";

/**
 * Service layer for Puja CRUD database operations.
 */

// 1. Create a new Puja document
export const createPujaService = async (pujaData) => {
  const puja = await Puja.create(pujaData);
  return puja;
};

// 2. Fetch all Pujas sorted by newest first
export const getAllPujasService = async () => {
  const pujas = await Puja.find({}).sort({ createdAt: -1 });
  return pujas;
};

// 3. Fetch a single Puja by MongoDB _id
export const getPujaByIdService = async (id) => {
  const puja = await Puja.findById(id);
  return puja;
};

// 4. Update an existing Puja by _id
export const updatePujaService = async (id, updateData) => {
  const updatedPuja = await Puja.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return updatedPuja;
};

// 5. Delete a Puja by _id
export const deletePujaService = async (id) => {
  const deletedPuja = await Puja.findByIdAndDelete(id);
  return deletedPuja;
};
