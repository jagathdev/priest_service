import express from "express";
import { updateProfile, getProfile, logoutUser } from "../controllers/user.controller.js";
import { requireAuth, requireUserOrAdmin, optionalAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/profile/:userId", requireAuth, requireUserOrAdmin, getProfile);
router.get("/profile", requireAuth, getProfile);
router.put("/updateProfile", requireAuth, requireUserOrAdmin, updateProfile);
router.post("/logout", optionalAuth, logoutUser);

export default router;