import express from "express";

import {
  getRequests,
  getRequestStats,
  getMyWorkerRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  cancelRequest,
} from "../controllers/request.controller.js";
import {
  createRating,
  getRating,
  updateRating,
  deleteRating,
} from "../controllers/rating.controller.js";
import verifyToken from "../middlewares/verify.middleware.js";
import {
  createRequestValidator,
  updateStatusValidator,
} from "../validators/request.validator.js";
import {
  createRatingValidator,
  updateRatingValidator,
} from "../validators/rating.validator.js";

const router = express.Router();

router.use(verifyToken);

router.get("/stats", getRequestStats);
router.get("/my-worker", getMyWorkerRequests);
router
  .route("/")
  .get(getRequests)
  .post(createRequestValidator, createRequest);
router.get("/:id", getRequestById);
router.patch("/:id/status", updateStatusValidator, updateRequestStatus);
router.patch("/:id/cancel", cancelRequest);

router
  .route("/:id/rating")
  .post(createRatingValidator, createRating)
  .get(getRating)
  .patch(updateRatingValidator, updateRating)
  .delete(deleteRating);

export default router;
