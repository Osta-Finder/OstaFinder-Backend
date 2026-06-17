import express from "express";
import multer from "multer";
import { getTopWorkersByCategory, getWorkers, getAdminWorkers, submitOnboarding, getWorkerProfile, getPendingWorkers, updateWorkerApproval } from "../controllers/worker.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });
import verifyToken from "../middlewares/verify.middleware.js";
import {
  getDashboardStats,
  getDashboardRequests,
  getIncomingRequests,
  updateRequestStatus,
  getWorkerWorks,
  getWorkerWorkById,
  addWorkerWork,
  updateWorkerWork,
  deleteWorkerWork,
  getPendingWorksApproval,
  updateWorkApproval
} from "../controllers/worker.controller.js";

import {
  getWorkerPublicProfile,
  getWorkerPublicServices,
  getWorkerPublicWorks,
  getWorkerPublicReviews
} from "../controllers/worker.profile.controller.js";

import {
  getWorkerServices,
  getWorkerServiceById,
  addWorkerService,
  updateWorkerService,
  deleteWorkerService,
} from "../controllers/services.controller.js";

const router = express.Router();

router.get("/profile", protect, getWorkerProfile)
router.post("/onboarding", protect, upload.none(), submitOnboarding)
router.get("/pending-approval", protect, restrictTo("admin"), getPendingWorkers)
router.get("/admin", protect, restrictTo("admin"), getAdminWorkers)
router.patch("/:workerId/approval", protect, restrictTo("admin"), updateWorkerApproval)
router.get("/works/pending-approval", protect, restrictTo("admin"), getPendingWorksApproval)
router.patch("/works/:workId/approval", protect, restrictTo("admin"), updateWorkApproval)
router.get("/top-by-category", getTopWorkersByCategory)
router.get("/", getWorkers)



router.get("/public/:id", getWorkerPublicProfile);

router.get("/public/:id/services", getWorkerPublicServices);

router.get("/public/:id/works", getWorkerPublicWorks);

router.get("/public/:id/reviews", getWorkerPublicReviews);

router.use(protect);
// Dashboard
router.get("/stats", getDashboardStats);
router.get("/dashboard-requests", getDashboardRequests);

// Incoming Requests
router.get("/requests", getIncomingRequests);
router.put("/requests/:id/status", updateRequestStatus);

// Services
router.route("/services").get(getWorkerServices).post(addWorkerService);

router
  .route("/services/:id")
  .get(getWorkerServiceById)
  .put(updateWorkerService)
  .delete(deleteWorkerService);

// Portfolio / Works
router
  .route("/works")
  .get(protect, getWorkerWorks)
  .post(protect, addWorkerWork);

router
  .route("/works/:id")
  .get(getWorkerWorkById)
  .put(updateWorkerWork)
  .delete(deleteWorkerWork);

export default router;
