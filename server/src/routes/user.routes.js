import express from "express";
import { updateProfile, getProfile } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/profile/:userId", getProfile);
router.get("/profile", getProfile);
router.put("/updateProfile", updateProfile);

export default router;