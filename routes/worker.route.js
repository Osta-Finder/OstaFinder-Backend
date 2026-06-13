import express from "express";
import multer from "multer";
import { getTopWorkersByCategory, getWorkers, submitOnboarding, getWorkerProfile, getPendingWorkers, updateWorkerApproval } from "../controllers/worker.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.get("/profile", protect, getWorkerProfile)
router.post("/onboarding", protect, upload.none(), submitOnboarding)
router.get("/pending-approval", protect, restrictTo("admin"), getPendingWorkers)
router.patch("/:workerId/approval", protect, restrictTo("admin"), updateWorkerApproval)
router.get("/top-by-category", getTopWorkersByCategory)
router.get("/", getWorkers)

export default router;