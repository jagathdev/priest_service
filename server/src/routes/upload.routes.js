import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  uploadDir,
  uploadImage,
  deleteImage,
  restoreImage,
  permanentDeleteImage,
  getAllMedia,
  editImage,
  deleteAllMedia,
} from "../controllers/uploadController.js";

// Multer storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    let baseName = req.body.customName || path.basename(file.originalname, ext);

    // Sanitize to clean slug
    baseName = baseName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!baseName) baseName = "media";

    const targetFileName = `${baseName}${ext}`;
    const targetFilePath = path.join(uploadDir, targetFileName);
    const fileExists = fs.existsSync(targetFilePath);
    const allowOverwrite =
      req.query?.overwrite === "true" ||
      req.query?.overwrite === true ||
      req.body?.overwrite === "true" ||
      req.body?.overwrite === true;

    if (fileExists && !allowOverwrite) {
      const err = new Error("FILE_ALREADY_EXISTS");
      err.code = "FILE_ALREADY_EXISTS";
      err.targetFileName = targetFileName;
      return cb(err);
    }

    // If overwrite is requested and old file exists, unlink it first so it is cleanly replaced
    if (fileExists && allowOverwrite) {
      try {
        fs.unlinkSync(targetFilePath);
      } catch (err) {
        // Continue if already unlocked
      }
    }

    cb(null, targetFileName);
  },
});

// Allowed file types: Images (PNG, JPG, JPEG, WEBP) & Videos (MP4, WEBM, MOV)
const fileFilter = (_req, file, cb) => {
  const imageAllowed = /jpeg|jpg|png|webp/;
  const videoAllowed = /mp4|webm|quicktime|mov/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype.toLowerCase();

  const isImage = imageAllowed.test(ext) && (imageAllowed.test(mime) || mime.includes("image"));
  const isVideo = videoAllowed.test(ext) || videoAllowed.test(mime) || mime.includes("video");

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error("Only images (.png, .jpg, .jpeg, .webp) and videos (.mp4, .webm, .mov) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // Up to 20MB limit (videos max 20MB, images checked in middleware)
});

const uploadMiddleware = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          code: "LIMIT_FILE_SIZE",
          message: "File exceeds size limit. Maximum allowed is 20 MB for videos and 3 MB for images.",
        });
      }
      if (err.code === "FILE_ALREADY_EXISTS" || err.message === "FILE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          code: "FILE_ALREADY_EXISTS",
          filename: err.targetFileName,
          message: `A file with the name "${err.targetFileName}" already exists.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process file upload.",
      });
    }

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video/");
      const isImage = req.file.mimetype.startsWith("image/");

      if (isImage && req.file.size > 3 * 1024 * 1024) {
        if (fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch {}
        }
        return res.status(400).json({
          success: false,
          code: "LIMIT_FILE_SIZE",
          message: "Max 3 MB image only allowed to upload. Please upload an image under 3 MB.",
        });
      }

      if (isVideo && req.file.size > 20 * 1024 * 1024) {
        if (fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch {}
        }
        return res.status(400).json({
          success: false,
          code: "LIMIT_FILE_SIZE",
          message: "Max 20 MB video only allowed to upload. Please upload a video under 20 MB.",
        });
      }
    }

    next();
  });
};

const router = express.Router();

// Routes mapped to controllers
router.get("/", getAllMedia);
router.post("/", uploadMiddleware, uploadImage);
router.put("/:filename/restore", restoreImage);
router.delete("/:filename/permanent", permanentDeleteImage);
router.put("/:filename", editImage);
router.delete("/all", deleteAllMedia);
router.delete("/:filename", deleteImage);

export default router;
