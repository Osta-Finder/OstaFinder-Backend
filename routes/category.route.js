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

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(createCategoryValidator, createCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .put(updateCategoryValidator, updateCategory)
  .delete(deleteCategory);

export default router;
