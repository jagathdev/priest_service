import express from "express";
import { getPoojaById } from "../controllers/pooja.controller.js";

const router = express.Router();

router.get("/:poojaId", getPoojaById);

export default router;