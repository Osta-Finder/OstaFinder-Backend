import express from "express";
import { getTopWorkersByCategory, getWorkers } from "../controllers/worker.controller.js";
import {
  getWorkerProfile,
  updateWorkerProfile,
  getWorkerServices,
  addWorkerService,
  updateWorkerService,
  deleteWorkerService,
  getWorkerPortfolio,
  addPortfolioItem,
  deletePortfolioItem,
  getWorkerReviews,
  addWorkerReview,
  deleteWorkerReview,
} from "../controllers/workerProfile.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";

const router = express.Router();

// ── Public ──────────────────────────────────
router.get("/top-by-category", getTopWorkersByCategory);
router.get("/", getWorkers);

// ── Profile ─────────────────────────────────
router.get("/:id/profile", getWorkerProfile);
router.put("/:id/profile", verifyToken, updateWorkerProfile);

// ── Services ────────────────────────────────
router.get("/:id/services", getWorkerServices);
router.post("/:id/services", verifyToken, addWorkerService);
router.put("/:id/services/:serviceId", verifyToken, updateWorkerService);
router.delete("/:id/services/:serviceId", verifyToken, deleteWorkerService);

// ── Portfolio ───────────────────────────────
router.get("/:id/portfolio", getWorkerPortfolio);
router.post("/:id/portfolio", verifyToken, addPortfolioItem);
router.delete("/:id/portfolio/:itemId", verifyToken, deletePortfolioItem);

// ── Reviews ─────────────────────────────────
router.get("/:id/reviews", getWorkerReviews);
router.post("/:id/reviews", verifyToken, addWorkerReview);
router.delete("/:id/reviews/:reviewId", verifyToken, deleteWorkerReview);

export default router;
