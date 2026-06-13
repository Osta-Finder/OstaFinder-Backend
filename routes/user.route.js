import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// All routes require auth + admin role
router.use(protect, restrictTo("admin"));

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
