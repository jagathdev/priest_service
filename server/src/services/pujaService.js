import Puja from "../models/pujaModel.js";
import { syncPujaDates } from "./pujaDateCalculator.service.js";

/**
 * Service layer for Puja CRUD database operations.
 */

// 1. Create a new Puja document
export const createPujaService = async (pujaData) => {
  const puja = await Puja.create(pujaData);
  return puja;
};

// 2. Fetch all Pujas sorted by newest first (auto-syncs dates beforehand)
export const getAllPujasService = async () => {
  // Ensure recurring dates are up to date in DB and responses
  try {
    await syncPujaDates();
  } catch (syncErr) {
    console.error("[getAllPujasService] Auto-sync dates warning:", syncErr.message);
  }
  const pujas = await Puja.find({}).sort({ createdAt: -1 });
  return pujas;
};

// 3. Fetch a single Puja by MongoDB _id (or slug fallback)
export const getPujaByIdService = async (id) => {
  try {
    await syncPujaDates();
  } catch (syncErr) {
    console.error("[getPujaByIdService] Auto-sync dates warning:", syncErr.message);
  }
  const puja = await Puja.findById(id);
  return puja;
};

// 4. Update an existing Puja by _id
export const updatePujaService = async (id, updateData) => {
  const updatedPuja = await Puja.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });
  return updatedPuja;
};

// 5. Delete a Puja by _id
export const deletePujaService = async (id) => {
  const deletedPuja = await Puja.findByIdAndDelete(id);
  return deletedPuja;
};
