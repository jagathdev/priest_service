import {
  createHomaService,
  getAllHomasService,
  getHomaByIdService,
  updateHomaService,
  deleteHomaService,
} from "../services/homaService.js";

/**
 * Controller layer for Homa REST API endpoints.
 */

// 1. POST /api/homas - Create a new Homa
export const createHoma = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Homa title is required",
      });
    }

    const homa = await createHomaService(req.body);

    return res.status(201).json({
      success: true,
      message: "Homa created successfully",
      data: homa,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 2. GET /api/homas - Get all Homas
export const getAllHomas = async (req, res) => {
  try {
    const homas = await getAllHomasService();

    return res.status(200).json({
      success: true,
      count: homas.length,
      data: homas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 3. GET /api/homas/:id - Get single Homa by ID
export const getHomaById = async (req, res) => {
  try {
    const { id } = req.params;
    const homa = await getHomaByIdService(id);

    if (!homa) {
      return res.status(404).json({
        success: false,
        error: "Homa not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: homa,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 4. PUT /api/homas/:id - Update Homa by ID
export const updateHoma = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHoma = await updateHomaService(id, req.body);

    if (!updatedHoma) {
      return res.status(404).json({
        success: false,
        error: "Homa not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Homa updated successfully",
      data: updatedHoma,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 5. DELETE /api/homas/:id - Delete Homa by ID
export const deleteHoma = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHoma = await deleteHomaService(id);

    if (!deletedHoma) {
      return res.status(404).json({
        success: false,
        error: "Homa not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Homa deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
