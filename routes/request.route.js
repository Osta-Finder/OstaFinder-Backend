import express from "express";

import {
  getRequests,
  getRequestStats,
  getRequestById,
  createRequest,
  updateRequestStatus,
  cancelRequest,
} from "../controllers/request.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";
import {
  createRequestValidator,
  updateStatusValidator,
} from "../validators/request.validator.js";

const router = express.Router();

router.use(verifyToken);

router.get("/stats", getRequestStats);
router
  .route("/")
  .get(getRequests)
  .post(createRequestValidator, createRequest);
router.get("/:id", getRequestById);
router.patch("/:id/status", updateStatusValidator, updateRequestStatus);
router.patch("/:id/cancel", cancelRequest);

export default router;
