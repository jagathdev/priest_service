import {
  createPujaService,
  getAllPujasService,
  getPujaByIdService,
  updatePujaService,
  deletePujaService,
} from "../services/pujaService.js";

/**
 * Controller layer for Puja REST API endpoints.
 */

// 1. POST /api/pujas - Create a new Puja
export const createPuja = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Puja title is required",
      });
    }

    const puja = await createPujaService(req.body);

    return res.status(201).json({
      success: true,
      message: "Puja created successfully",
      data: puja,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 2. GET /api/pujas - Get all Pujas
export const getAllPujas = async (req, res) => {
  try {
    const pujas = await getAllPujasService();

    return res.status(200).json({
      success: true,
      count: pujas.length,
      data: pujas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 3. GET /api/pujas/:id - Get single Puja by ID
export const getPujaById = async (req, res) => {
  try {
    const { id } = req.params;
    const puja = await getPujaByIdService(id);

    if (!puja) {
      return res.status(404).json({
        success: false,
        error: "Puja not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: puja,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 4. PUT /api/pujas/:id - Update Puja by ID
export const updatePuja = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPuja = await updatePujaService(id, req.body);

    if (!updatedPuja) {
      return res.status(404).json({
        success: false,
        error: "Puja not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Puja updated successfully",
      data: updatedPuja,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 5. DELETE /api/pujas/:id - Delete Puja by ID
export const deletePuja = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPuja = await deletePujaService(id);

    if (!deletedPuja) {
      return res.status(404).json({
        success: false,
        error: "Puja not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Puja deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
