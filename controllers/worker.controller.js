import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

import categoryModel from "../models/category.model.js";
import workerModel from "../models/worker.model.js";
import Service from "../models/service.model.js";
import Portfolio from "../models/portfolio.model.js";
import Request from "../models/request.model.js";
import ApiError from "../utils/ApiError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

const getWorkerId = (req) => req.user?.id || req.user?._id;

// ============================================
// STATS & DASHBOARD
// ============================================
export const getDashboardStats = async (req, res, next) => {
  try {
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const totalRequests = await Request.countDocuments({ worker: workerId });
    const completedRequests = await Request.countDocuments({
      worker: workerId,
      status: "completed",
    });
    const totalEarningsResult = await Request.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(workerId),
          status: "completed",
          price: { $ne: null },
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

export const getDashboardRequests = async (req, res, next) => {
  try {
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

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
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

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
    const { status } = req.body;
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const request = await Request.findOneAndUpdate(
      { _id: id, worker: workerId },
      { status },
      { new: true },
    );

    if (!request) {
      return next(new ApiError("Request not found", 404));
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};



// ============================================
// PORTFOLIO / WORKS
// ============================================
export const getWorkerWorks = async (req, res, next) => {
  try {
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

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
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const work = await Portfolio.findOne({ _id: id, worker: workerId });

    if (!work) {
      return next(new ApiError("Work not found", 404));
    }

    res.status(200).json({ success: true, data: work });
  } catch (error) {
    next(error);
  }
};

export const addWorkerWork = async (req, res, next) => {
  try {
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const worker = await workerModel.findById(workerId).populate("category");
    const categoryName = worker?.category?.name || "غير محدد";

    const { title, clientName, description, date, status, location, price, images } =
      req.body;

    const work = await Portfolio.create({
      worker: workerId,
      title,
      category: categoryName,
      clientName,
      description,
      date,
      source: "outside",
      status: status || "completed",
      location,
      price,
      images: images || [],
    });

    res.status(201).json({ success: true, data: work });
  } catch (error) {
    next(error);
  }
};
export const updateWorkerWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

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
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

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

// ============================================
// WORKER LIST & ONBOARDING
// ============================================
// @desc    Get list of workers with filtering, pagination, sorting, and search
// @route   GET /workers
// @access  Public
export const getWorkers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;
  const search = req.query.search || req.query.keyword || "";

  let filter = {};

  if (search) {
    const matchingCategories = await categoryModel
      .find({
        name: { $regex: search, $options: "i" },
      })
      .select("_id");

    const categoryIds = matchingCategories.map((cat) => cat._id);

    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { category: { $in: categoryIds } }
    ];
  }

  // Preserve other query filters if they exist (excluding page, limit, search, keyword, sort)
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'keyword'];
  excludedFields.forEach(el => delete queryObj[el]);
  
  if (Object.keys(queryObj).length > 0) {
    filter = { ...filter, ...queryObj };
  }

  const total = await workerModel.countDocuments(filter);
  const pages = Math.ceil(total / limit) || 1;

  // Sorting
  let sortBy = { createdAt: -1 };
  if (req.query.sort) {
    sortBy = req.query.sort.split(',').join(' ');
  }

  const workers = await workerModel
    .find(filter)
    .populate("category", "name")
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: workers,
    total,
    pages,
    page,
    limit,
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

export const submitOnboarding = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Request body is empty",
    });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    city,
    address,
    specialization,
    yearsOfExperience,
    bio,
    nationalId,
    certificates,
    price,
  } = req.body;

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  const workerId = getWorkerId(req);

  const updateData = {
    name: `${firstName} ${lastName}`,
    email,
    phoneNumber: phone,
  };

  if (specialization) {
    let categoryId = null;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(specialization);

    if (isValidObjectId) {
      categoryId = specialization;
    } else {
      const category = await categoryModel.findOne({ name: specialization });
      if (category) {
        categoryId = category._id;
      } else {
        return res.status(400).json({
          success: false,
          message: `Category "${specialization}" not found`,
        });
      }
    }

    updateData.category = categoryId;
  }

  if (yearsOfExperience) {
    updateData.yearsOfExperience = yearsOfExperience;
  }
  if (price) {
    updateData.price = Number(price);
  }
  if (bio) {
    updateData.bio = bio;
  }
  if (address) {
    updateData.address = address;
  }
  if (city) {
    updateData.city = city;
  }
  if (nationalId) {
    updateData.nationalId = nationalId;
  }
  if (certificates) {
    if (Array.isArray(certificates)) {
      updateData.certificates = certificates;
    } else if (typeof certificates === "string") {
      updateData.certificates = [certificates];
    }
  }

  updateData.isOnboarded = true;
  updateData.onboardingCompleted = true;
  updateData.approvalStatus = "pending";

  const updatedWorker = await workerModel
    .findByIdAndUpdate(workerId, updateData, {
      returnDocument: "after",
      runValidators: false,
    })
    .populate("category", "name");

  if (!updatedWorker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Onboarding completed successfully",
    data: updatedWorker,
  });
});

export const getWorkerProfile = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  const workerId = getWorkerId(req);
  const worker = await workerModel
    .findById(workerId)
    .populate("category", "name");

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found",
    });
  }

  res.status(200).json({
    success: true,
    data: worker,
  });
});

export const getPendingWorkers = asyncHandler(async (req, res, next) => {
  const pendingWorkers = await workerModel
    .find({ approvalStatus: "pending" })
    .populate("category", "name")
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: pendingWorkers.length,
    data: pendingWorkers,
  });
});

// @desc    Approve or reject worker
// @route   PATCH /workers/:workerId/approval
// @access  Admin
export const updateWorkerApproval = asyncHandler(async (req, res, next) => {
  const { workerId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be 'approved' or 'rejected'",
    });
  }

  const updateData = {
    approvalStatus: status,
  };

  if (status === "approved") {
    updateData.approvedAt = new Date();
  }

  const updatedWorker = await workerModel
    .findByIdAndUpdate(workerId, updateData, {
      returnDocument: "after",
      runValidators: false,
    })
    .populate("category", "name")
    .select("-password -refreshToken");

  if (!updatedWorker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found",
    });
  }

  res.status(200).json({
    success: true,
    message: `Worker ${status} successfully`,
    data: updatedWorker,
  });
});
