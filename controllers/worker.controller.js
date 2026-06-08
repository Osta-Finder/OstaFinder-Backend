import asyncHandler from "express-async-handler";

import categoryModel from "../models/category.model.js";
import workerModel from "../models/worker.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";

// @desc    Get list of workers with filtering, pagination, sorting, and search
// @route   GET /workers
// @access  Public
export const getWorkers = asyncHandler(async (req, res, next) => {
    let filter = {};
    // Search
    if (req.query.keyword) {
      const matchingCategories = await categoryModel
        .find({
          name: { $regex: req.query.keyword, $options: "i" },
        })
        .select("_id");

      const categoryIds = matchingCategories.map((cat) => cat._id);

      filter.$or = [
        {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          category: {
            $in: categoryIds,
          },
        },
      ];
    }
    // Build query
    const apiFeatures = new ApiFeatures(workerModel.find(filter), req.query)
      .filter()
      .sort();
    // Get correct count after all filters
    const countDocuments = await workerModel.countDocuments(
      apiFeatures.mongooseQuery.getFilter(),
    );
    // Pagination
    apiFeatures.paginate(countDocuments);
    // Execute query
    const workers = await apiFeatures.mongooseQuery.populate(
      "category",
      "name",
    );

    res.status(200).json({
      success: true,
      results: workers.length,
      pagination: apiFeatures.paginationResult,
      data: workers,
    });
});

// @desc    Get top rated worker in each category
// @route   GET /workers/top-by-category
// @access  Public
export const getTopWorkersByCategory = asyncHandler(async (req, res, next) => {
    const topWorkers = await workerModel.aggregate([
      { $sort: { rating: -1 } },
      {
        $group: {
          _id: "$category",
          worker: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$worker" },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $sort: { rating: -1 },
      },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      results: topWorkers.length,
      data: topWorkers,
    });
});
