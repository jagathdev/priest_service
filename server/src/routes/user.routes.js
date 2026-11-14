import express from "express";
import { updateProfile, getProfile, logoutUser } from "../controllers/user.controller.js";
import { requireAuth, requireUserOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/logout", logoutUser);
router.get("/profile/:userId", requireAuth, requireUserOrAdmin, getProfile);
router.get("/profile", requireAuth, getProfile);
router.put("/updateProfile", requireAuth, requireUserOrAdmin, updateProfile);

export default router;