import express from "express";
import { getTopWorkersByCategory, getWorkers } from "../controllers/worker.controller.js";
import {
  getWorkerProfile,

  getWorkerServices,
 

 
  getWorkerPortfolio,


  getWorkerReviews,


  bookWorkerService,
} from "../controllers/workerProfile.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";

const router = express.Router();

// ─── Public Routes ───────────────────────────────────────────
router.get("/top-by-category", getTopWorkersByCategory);
router.get("/", getWorkers);

// ─── Worker Profile ──────────────────────────────────────────
router.get("/:id/profile", getWorkerProfile);

// ─── Worker Services ─────────────────────────────────────────
router.get("/:id/services", getWorkerServices);


// ─── Worker Portfolio ────────────────────────────────────────
router.get("/:id/portfolio", getWorkerPortfolio);

// ─── Worker Reviews ──────────────────────────────────────────
router.get("/:id/reviews", getWorkerReviews);


// ─── Quick Booking ───────────────────────────────────────────
router.post("/:id/book", verifyToken, bookWorkerService);

export default router;