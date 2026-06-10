import express from "express";
import { createOrder } from "../controllers/reqOrder.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";

const router = express.Router();

router.post('/:workerId', verifyToken, createOrder);

export default router;
