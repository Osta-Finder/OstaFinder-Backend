import express from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router
  .route("/")
  .get( getCategories)
  .post(protect, restrictTo("admin"), createCategoryValidator, createCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, restrictTo("admin"), updateCategoryValidator, updateCategory)
  .delete(protect, restrictTo("admin"), deleteCategory);

export default router;
