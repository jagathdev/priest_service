import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Media from "../models/Media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Physical upload directory: server/public/images
export const uploadDir = path.resolve(__dirname, "../../public/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Upload Image Controller
 * Saves uploaded file metadata into MongoDB and returns clean public URL
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }
    const filename = req.file.filename;
    const url = `/images/${filename}`;

    // Store in MongoDB Media collection
    const mediaDoc = await Media.create({
      filename,
      originalName: req.file.originalname,
      url,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: mediaDoc,
      filename,
      url,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image.",
    });
  }
};

/**
 * Delete Image Controller
 * Removes the physical file from server/public/images and deletes record from MongoDB
 */
export const deleteImage = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    // 1. Remove from MongoDB
    const deletedRecord = await Media.findOneAndDelete({ filename });

    // 2. Remove physical file from disk if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (!deletedRecord && !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `Image "${filename}" was not found on server storage.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Image "${filename}" deleted successfully from server storage and database.`,
      deleted: deletedRecord,
    });
  } catch (error) {
    console.error("Delete controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete image.",
    });
  }
};

/**
 * Get All Uploaded Images (Media Library)
 * Returns all uploaded images stored in MongoDB
 */
export const getAllMedia = async (_req, res) => {
  try {
    const mediaList = await Media.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: mediaList.length,
      data: mediaList,
    });
  } catch (error) {
    console.error("Get media library error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch media library.",
    });
  }
};
