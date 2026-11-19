import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Media from "../models/Media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Physical upload directory: project root /assets (parallel to client and server)
export const uploadDir = process.env.ASSETS_DIR
  ? path.resolve(process.env.ASSETS_DIR)
  : path.resolve(__dirname, "../../../assets");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Upload Media Controller
 * Saves uploaded file metadata into MongoDB and returns clean public URL (/assets/filename)
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No media file provided." });
    }

    const filename = req.file.filename;
    const url = `/assets/${filename}`;

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
      message: "Media uploaded successfully",
      data: mediaDoc,
      filename,
      url,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload media.",
    });
  }
};

/**
 * Delete Media Controller (Soft Delete / Move to Trash)
 * Flags the media as deleted without unlinking the physical file
 */
export const deleteImage = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    const media = await Media.findOne({ filename });
    if (!media) {
      return res.status(404).json({
        success: false,
        message: `File "${filename}" was not found.`,
      });
    }

    media.isDeleted = true;
    media.deletedAt = new Date();
    await media.save();

    return res.status(200).json({
      success: true,
      message: `File "${filename}" moved to trash. You can restore it anytime.`,
      data: media,
    });
  } catch (error) {
    console.error("Delete controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete file.",
    });
  }
};

/**
 * Restore Media Controller
 * Restores a soft-deleted item back to active media library
 */
export const restoreImage = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    const media = await Media.findOne({ filename });
    if (!media) {
      return res.status(404).json({
        success: false,
        message: `File "${filename}" was not found.`,
      });
    }

    media.isDeleted = false;
    media.deletedAt = null;
    await media.save();

    return res.status(200).json({
      success: true,
      message: `File "${filename}" restored successfully to active media gallery.`,
      data: media,
    });
  } catch (error) {
    console.error("Restore controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to restore file.",
    });
  }
};

/**
 * Permanent Delete Media Controller
 * Removes the physical file from root /assets and deletes record from MongoDB
 */
export const permanentDeleteImage = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    // 1. Remove from MongoDB
    const deletedRecord = await Media.findOneAndDelete({ filename });

    // 2. Remove physical file from root assets disk if it exists
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn("Failed to unlink file on disk:", err.message);
      }
    }

    if (!deletedRecord && !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `File "${filename}" was not found on server storage.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `File "${filename}" permanently deleted from server storage and database.`,
      deleted: deletedRecord,
    });
  } catch (error) {
    console.error("Permanent delete controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to permanently delete file.",
    });
  }
};

/**
 * Get All Uploaded Media (Media Library)
 * Returns files stored in MongoDB (supports ?trash=true) and syncs physical root assets
 */
export const getAllMedia = async (req, res) => {
  try {
    const isTrash = req.query?.trash === "true" || req.query?.trash === true;

    // Scan uploadDir (root assets) to ensure any physical file has a Media record
    if (fs.existsSync(uploadDir)) {
      const diskFiles = fs.readdirSync(uploadDir);
      for (const file of diskFiles) {
        if (file === ".gitkeep") continue;
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase();
          const isImg = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
          const isVid = [".mp4", ".webm", ".mov"].includes(ext);

          if (isImg || isVid) {
            let mime = "application/octet-stream";
            if (ext === ".png") mime = "image/png";
            else if (ext === ".webp") mime = "image/webp";
            else if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
            else if (ext === ".mp4") mime = "video/mp4";
            else if (ext === ".webm") mime = "video/webm";
            else if (ext === ".mov") mime = "video/quicktime";

            const existing = await Media.findOne({ filename: file });
            if (!existing) {
              await Media.create({
                filename: file,
                originalName: file,
                url: `/assets/${file}`,
                mimeType: mime,
                size: stats.size,
                uploadedBy: "admin",
                isDeleted: false,
              });
            }
          }
        }
      }
    }

    const query = { isDeleted: isTrash ? true : { $ne: true } };
    const mediaList = await Media.find(query).sort({ createdAt: -1 });

    const totalActiveCount = await Media.countDocuments({ isDeleted: { $ne: true } });
    const totalTrashCount = await Media.countDocuments({ isDeleted: true });

    return res.status(200).json({
      success: true,
      count: mediaList.length,
      data: mediaList,
      stats: {
        active: totalActiveCount,
        trash: totalTrashCount,
      },
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
 * Edit / Rename Media Controller
 * Renames physical file in root /assets and updates MongoDB record
 */
export const editImage = async (req, res) => {
  try {
    const oldFilename = path.basename(req.params.filename);
    const { newName } = req.body;

    if (!newName || typeof newName !== "string" || !newName.trim()) {
      return res.status(400).json({
        success: false,
        message: "New filename is required.",
      });
    }

    const ext = path.extname(oldFilename).toLowerCase();
    let sanitizedBase = newName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!sanitizedBase) sanitizedBase = "media";
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
        message: `A file with the name "${targetFilename}" already exists.`,
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
        url: `/assets/${targetFilename}`,
      },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: `File successfully renamed to "${targetFilename}".`,
      data: updatedMedia,
    });
  } catch (error) {
    console.error("Edit media controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to edit file.",
    });
  }
};

/**
 * Delete All Uploaded Media
 * Wipes files from root /assets and clears Media collection
 */
export const deleteAllMedia = async (_req, res) => {
  try {
    let deletedFilesCount = 0;

    // Delete physical files
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        if (file === ".gitkeep") continue;
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
      message: `All files deleted successfully (${deletedFilesCount} files removed from storage, ${deleteResult.deletedCount} database records removed).`,
      count: deletedFilesCount,
    });
  } catch (error) {
    console.error("Delete all media error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete all files.",
    });
  }
};
