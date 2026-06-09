import express from "express";
import multer from "multer";
import { getTopWorkersByCategory, getWorkers, submitOnboarding, getWorkerProfile } from "../controllers/worker.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.get("/profile", protect, getWorkerProfile)
router.post("/onboarding", protect, upload.any(), submitOnboarding)
router.get("/top-by-category", getTopWorkersByCategory)
router.get("/", getWorkers)

export default router;