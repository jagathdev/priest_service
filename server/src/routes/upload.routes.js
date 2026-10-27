import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadDir, uploadImage, deleteImage, getAllMedia } from "../controllers/uploadController.js";

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

    if (!baseName) baseName = "image";

    const targetFileName = `${baseName}${ext}`;
    const fileExists = fs.existsSync(path.join(uploadDir, targetFileName));
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

    cb(null, targetFileName);
  },
});

// Allowed file types: PNG, JPG, JPEG, WEBP
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype.toLowerCase();

  if (allowed.test(ext) && (allowed.test(mime) || mime.includes("image"))) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, .jpeg, and .webp format files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadMiddleware = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "FILE_ALREADY_EXISTS" || err.message === "FILE_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          code: "FILE_ALREADY_EXISTS",
          filename: err.targetFileName,
          message: `An image with the name "${err.targetFileName}" already exists.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to process image upload.",
      });
    }
    next();
  });
};

const router = express.Router();

// Routes mapped to controllers
router.get("/", getAllMedia);
router.post("/", uploadMiddleware, uploadImage);
router.delete("/:filename", deleteImage);

export default router;
