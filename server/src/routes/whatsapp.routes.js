
import express from "express";
import {
    optInCustomer,
    confirmCustomerOrder,
} from "../controllers/whatsapp.controller.js";

const router = express.Router();

router.post("/opt-in", optInCustomer);
router.post("/order-confirmation", confirmCustomerOrder);

export default router;