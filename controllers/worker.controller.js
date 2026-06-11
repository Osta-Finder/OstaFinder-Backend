import mongoose from "mongoose";
import Worker from "../models/worker.model.js";
import Service from "../models/service.model.js";
import Portfolio from "../models/portfolio.model.js";
import Request from "../models/request.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "express-async-handler";
import categoryModel from "../models/category.model.js";
import workerModel from "../models/worker.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";

// ============================================
// STATS & DASHBOARD
// ============================================
export const getDashboardStats = async (req, res, next) => {
  try {
    const workerId = req.user.id;

    // Calculate stats
    const totalRequests = await Request.countDocuments({ worker: workerId });
    const completedRequests = await Request.countDocuments({
      worker: workerId,
      status: "completed",
    });

    const totalEarningsResult = await Portfolio.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(workerId),
          source: "platform",
        },
      },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const totalEarnings = totalEarningsResult[0]?.total || 0;

    const stats = {
      totalOrders: { value: totalRequests, change: "+0%", period: "هذا الشهر" },
      employmentRate: {
        value:
          totalRequests > 0
            ? `${Math.round((completedRequests / totalRequests) * 100)}%`
            : "0%",
        change: "+0%",
        period: "هذا الشهر",
      },
      totalEarnings: {
        value: totalEarnings,
        currency: "ج.م",
        change: "+0%",
        period: "هذا الشهر",
      },
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

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

  // Implementation or feature call can continue here using filter...
});

export const getDashboardRequests = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    // Get recent requests
    const requests = await Request.find({ worker: workerId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// ============================================
// INCOMING REQUESTS
// ============================================
export const getIncomingRequests = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const requests = await Request.find({
      worker: workerId,
      status: { $in: ["pending", "awaiting_approval"] },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. "in_progress", "rejected"
    const workerId = req.user.id;

    const request = await Request.findOneAndUpdate(
      { _id: id, worker: workerId },
      { status },
      { new: true },
    );

    if (!request) {
      return next(new ApiError("Request not found", 404));
    }

    // NOTE: Portfolio auto-creation on completion is handled exclusively
    // in request.controller.js -> updateRequestStatus to avoid duplication.

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// ============================================
// SERVICES
// ============================================
export const getWorkerServices = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const services = await Service.find({ worker: workerId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const getWorkerServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;
    const service = await Service.findOne({ _id: id, worker: workerId });

    if (!service) {
      return next(new ApiError("Service not found", 404));
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const addWorkerService = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const { title, category, price, description, location } = req.body;

    const service = await Service.create({
      worker: workerId,
      title,
      category,
      price,
      description,
      location,
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const updateWorkerService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;

    const service = await Service.findOneAndUpdate(
      { _id: id, worker: workerId },
      req.body,
      { new: true },
    );

    if (!service) {
      return next(new ApiError("Service not found", 404));
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkerService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;

    const service = await Service.findOneAndDelete({
      _id: id,
      worker: workerId,
    });

    if (!service) {
      return next(new ApiError("Service not found", 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// ============================================
// PORTFOLIO / WORKS
// ============================================
export const getWorkerWorks = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const works = await Portfolio.find({ worker: workerId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: works });
  } catch (error) {
    next(error);
  }
};

export const getWorkerWorkById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;
    const work = await Portfolio.findOne({ _id: id, worker: workerId });

    if (!work) {
      return next(new ApiError("Work not found", 404));
    }

    res.status(200).json({ success: true, data: work });
  } catch (error) {
    next(error);
  }
};

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

  res.status(200).json({ success: true, data: topWorkers });
});

export const addWorkerWork = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const {
      title,
      category,
      clientName,
      description,
      date,
      status,
      location,
      price,
    } = req.body;

    const work = await Portfolio.create({
      worker: workerId,
      title,
      category,
      clientName,
      description,
      date,
      source: "outside",
      status: status || "completed",
      location,
      price,
    });

    res.status(201).json({ success: true, data: work });
  } catch (error) {
    next(error);
  }
};

export const updateWorkerWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;

    const existingWork = await Portfolio.findOne({ _id: id, worker: workerId });

    if (!existingWork) {
      return next(new ApiError("Work not found", 404));
    }

    if (existingWork.source === "platform") {
      return next(
        new ApiError("لا يمكن تعديل الأعمال المنفذة عبر المنصة", 403),
      );
    }

    const { source, ...updateData } = req.body;

    const work = await Portfolio.findOneAndUpdate(
      { _id: id, worker: workerId },
      { ...updateData, source: "outside" },
      { new: true },
    );

    res.status(200).json({ success: true, data: work });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkerWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;

    const existingWork = await Portfolio.findOne({ _id: id, worker: workerId });

    if (!existingWork) {
      return next(new ApiError("Work not found", 404));
    }

    if (existingWork.source === "platform") {
      return next(new ApiError("لا يمكن حذف الأعمال المنفذة عبر المنصة", 403));
    }

    await existingWork.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};