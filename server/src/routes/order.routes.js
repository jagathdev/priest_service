import express from "express";
import { previewOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/preview", previewOrder);

export default router;