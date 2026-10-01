import express from "express";

import {
    getHeroBanners,
    getHeroBannerById,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
} from "../controllers/heroBanner.Controller.js";

const router = express.Router();

router.get("/", getHeroBanners);

router.get("/:id", getHeroBannerById);

router.post("/", createHeroBanner);

router.put("/:id", updateHeroBanner);

router.delete("/:id", deleteHeroBanner);

export default router;