import express from "express";

import {
    updateWishList,
    getWishlist,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.post("/updateWishlist", updateWishList);

router.get("/:userId", getWishlist);

export default router;