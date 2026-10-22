import express from "express";

import {
    createCustomerQuery,
} from "../controllers/customerQuery.controller.js";
import { validateRequest } from "../middlewares/validate.js";
import { validateCustomerQuery } from "../validators/public.schemas.js";

const router = express.Router();

router.post("/", validateRequest(validateCustomerQuery), createCustomerQuery);

export default router;