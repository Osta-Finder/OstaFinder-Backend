import express from "express";
import verifyToken from "../middlewares/verify.middleware.js";
import {
  getDashboardStats,
  getDashboardRequests,
  getIncomingRequests,
  updateRequestStatus,
  getWorkerServices,
  getWorkerServiceById,
  addWorkerService,
  updateWorkerService,
  deleteWorkerService,
  getWorkerWorks,
  getWorkerWorkById,
  addWorkerWork,
  updateWorkerWork,
  deleteWorkerWork,
} from "../controllers/worker.controller.js";

const router = express.Router();

import Worker from "../models/worker.model.js";

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
router.route("/works").get(getWorkerWorks).post(addWorkerWork);

router
  .route("/works/:id")
  .get(getWorkerWorkById)
  .put(updateWorkerWork)
  .delete(deleteWorkerWork);

export default router;
