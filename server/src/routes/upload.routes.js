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

    // Deduplicate / increment if file already exists
    let finalName = `${baseName}${ext}`;
    let counter = 1;
    while (fs.existsSync(path.join(uploadDir, finalName))) {
      finalName = `${baseName}-${counter}${ext}`;
      counter++;
    }

    cb(null, finalName);
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

const router = express.Router();

// Routes mapped to controllers
router.get("/", getAllMedia);
router.post("/", upload.single("image"), uploadImage);
router.delete("/:filename", deleteImage);

export default router;
