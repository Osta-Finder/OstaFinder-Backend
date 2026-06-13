import express from "express";
import multer from "multer";
import {
  getTopWorkersByCategory,
  getWorkers,
  submitOnboarding,
  getWorkerProfile,
  getPendingWorkers,
  updateWorkerApproval,
} from "../controllers/worker.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import Worker from "../models/worker.model.js";

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
  deleteWorkerWork
} from "../controllers/worker.controller.js";

import {
  getWorkerPublicProfile,
  getWorkerPublicServices,
  getWorkerPublicWorks,
  getWorkerPublicReviews
} from "../controllers/worker.profile.controller.js";

const router = express.Router();

router.get("/profile", protect, getWorkerProfile)
router.post("/onboarding", protect, upload.none(), submitOnboarding)
router.get("/pending-approval", getPendingWorkers)
router.patch("/:workerId/approval", updateWorkerApproval)
router.get("/top-by-category", getTopWorkersByCategory)
router.get("/", getWorkers)



router.get("/public/:id", getWorkerPublicProfile);

router.get("/public/:id/services", getWorkerPublicServices);

router.get("/public/:id/works", getWorkerPublicWorks);

router.get("/public/:id/reviews", getWorkerPublicReviews);

router.use(verifyToken); // Disabled for testing

// // Temporary testing middleware to mock authentication
// router.use(async (req, res, next) => {
//   try {
//     const worker = await Worker.findOne();
//     if (!worker) {
//       return res.status(404).json({
//         success: false,
//         message: "No workers found in DB for testing.",
//       });
//     }
//     req.user = { id: worker._id };
//     next();
//   } catch (err) {
//     next(err);
//   }
// });
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
