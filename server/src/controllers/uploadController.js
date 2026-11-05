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
    const url = `/api/images/${filename}`;

    // Upsert in MongoDB Media collection to avoid duplicate records on overwrite
    const mediaDoc = await Media.findOneAndUpdate(
      { filename },
      {
        filename,
        originalName: req.file.originalname,
        url,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: "admin",
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

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
 * Returns all uploaded images stored in MongoDB, synchronized with files on disk
 */
export const getAllMedia = async (_req, res) => {
  try {
    // Scan uploadDir to ensure any physical file has a Media record
    if (fs.existsSync(uploadDir)) {
      const diskFiles = fs.readdirSync(uploadDir);
      for (const file of diskFiles) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
            const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
            await Media.findOneAndUpdate(
              { filename: file },
              {
                filename: file,
                originalName: file,
                url: `/api/images/${file}`,
                mimeType: mime,
                size: stats.size,
                uploadedBy: "admin",
              },
              { upsert: true, setDefaultsOnInsert: true }
            );
          }
        }
      }
    }

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

/**
 * Edit / Rename Image Controller
 * Renames physical file on disk and updates MongoDB record
 */
export const editImage = async (req, res) => {
  try {
    const oldFilename = path.basename(req.params.filename);
    const { newName } = req.body;

    if (!newName || typeof newName !== "string" || !newName.trim()) {
      return res.status(400).json({
        success: false,
        message: "New image name is required.",
      });
    }

    const ext = path.extname(oldFilename).toLowerCase();
    let sanitizedBase = newName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!sanitizedBase) sanitizedBase = "image";
    const targetFilename = `${sanitizedBase}${ext}`;

    if (oldFilename === targetFilename) {
      const existing = await Media.findOne({ filename: oldFilename });
      return res.status(200).json({
        success: true,
        message: "No changes needed (same filename).",
        data: existing,
      });
    }

    const oldFilePath = path.join(uploadDir, oldFilename);
    const newFilePath = path.join(uploadDir, targetFilename);

    if (fs.existsSync(newFilePath)) {
      return res.status(409).json({
        success: false,
        message: `An image with the name "${targetFilename}" already exists.`,
      });
    }

    // Rename file on disk if it exists
    if (fs.existsSync(oldFilePath)) {
      fs.renameSync(oldFilePath, newFilePath);
    }

    // Update in MongoDB
    const updatedMedia = await Media.findOneAndUpdate(
      { filename: oldFilename },
      {
        filename: targetFilename,
        originalName: `${sanitizedBase}${ext}`,
        url: `/api/images/${targetFilename}`,
      },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: `Image successfully renamed to "${targetFilename}".`,
      data: updatedMedia,
    });
  } catch (error) {
    console.error("Edit image controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to edit image.",
    });
  }
};

/**
 * Delete All Uploaded Images
 * Wipes all files from server/public/images and clears Media collection
 */
export const deleteAllMedia = async (_req, res) => {
  try {
    let deletedFilesCount = 0;

    // Delete physical files
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          deletedFilesCount++;
        }
      }
    }

    // Delete DB records
    const deleteResult = await Media.deleteMany({});

    return res.status(200).json({
      success: true,
      message: `All images deleted successfully (${deletedFilesCount} files removed from storage, ${deleteResult.deletedCount} database records removed).`,
      count: deletedFilesCount,
    });
  } catch (error) {
    console.error("Delete all media error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all images.",
    });
  }
};
