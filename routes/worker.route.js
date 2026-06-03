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
    deleteWorkerWork
} from "../controllers/worker.controller.js";

const router = express.Router();

// router.use(verifyToken);

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/dashboard-requests", getDashboardRequests);

// Incoming Requests
router.get("/requests", getIncomingRequests);
router.put("/requests/:id/status", updateRequestStatus);

// Services
router.route("/services")
    .get(getWorkerServices)
    .post(addWorkerService);

router.route("/services/:id")
    .get(getWorkerServiceById)
    .put(updateWorkerService)
    .delete(deleteWorkerService);

// Portfolio / Works
router.route("/works")
    .get(getWorkerWorks)
    .post(addWorkerWork);

router.route("/works/:id")
    .get(getWorkerWorkById)
    .put(updateWorkerWork)
    .delete(deleteWorkerWork);

export default router;
