import express from "express";
import { createOrder } from "../controllers/reqOrder.controller.js";

const router = express.Router();

router.post('/:workerId', createOrder)

export default router;