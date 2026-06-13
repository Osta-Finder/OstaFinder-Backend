import express from "express";
import { createOrder, getOrders } from "../controllers/reqOrder.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.post('/:workerId', createOrder);
router.get('/', getOrders);

export default router;