import express from "express";

import {
    updateWishList,
    getWishlist,
} from "../controllers/wishlist.controller.js";
import { requireAuth, requireUserOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/updateWishlist", requireAuth, requireUserOrAdmin, updateWishList);

router.get("/:userId", requireAuth, requireUserOrAdmin, getWishlist);

export default router;