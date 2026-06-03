import express from "express";
import { getTopWorkersByCategory, getWorkers } from "../controllers/worker.controller.js";

const router = express.Router()

router.get("/top-by-category", getTopWorkersByCategory)
router.get("/", getWorkers)

export default router;