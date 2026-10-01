import express from "express";
import { updateProfile, getProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:userId", getProfile);
router.get("/profile", getProfile);
router.put("/updateProfile", updateProfile);

export default router;