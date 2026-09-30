import express from "express";

import {
    createCustomerQuery,
} from "../controllers/customerQuery.controller.js";

const router = express.Router();

router.post("/", createCustomerQuery);

export default router;