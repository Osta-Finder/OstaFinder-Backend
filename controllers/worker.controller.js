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

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Total Requests
    const currentMonthRequests = await Request.countDocuments({
      worker: workerId,
      createdAt: { $gte: startOfCurrentMonth },
    });
    const prevMonthRequests = await Request.countDocuments({
      worker: workerId,
      createdAt: { $gte: startOfPrevMonth, $lt: startOfCurrentMonth },
    });

    let requestsChange = 0;
    if (prevMonthRequests > 0) {
      requestsChange = Math.round(((currentMonthRequests - prevMonthRequests) / prevMonthRequests) * 100);
    } else if (currentMonthRequests > 0) {
      requestsChange = 100;
    }
    const requestsChangeStr = requestsChange >= 0 ? `+${requestsChange}%` : `${requestsChange}%`;

    // 2. Completed / Employment Rate
    const currentMonthCompleted = await Request.countDocuments({
      worker: workerId,
      status: "completed",
      createdAt: { $gte: startOfCurrentMonth },
    });
    const prevMonthCompleted = await Request.countDocuments({
      worker: workerId,
      status: "completed",
      createdAt: { $gte: startOfPrevMonth, $lt: startOfCurrentMonth },
    });

    const currentEmploymentRate = currentMonthRequests > 0
      ? Math.round((currentMonthCompleted / currentMonthRequests) * 100)
      : 0;
    const prevEmploymentRate = prevMonthRequests > 0
      ? Math.round((prevMonthCompleted / prevMonthRequests) * 100)
      : 0;

    let rateChange = currentEmploymentRate - prevEmploymentRate;
    const rateChangeStr = rateChange >= 0 ? `+${rateChange}%` : `${rateChange}%`;

    // 3. Earnings (using correct amount field!)
    const currentMonthEarningsResult = await Request.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(workerId),
          status: "completed",
          amount: { $ne: null },
          createdAt: { $gte: startOfCurrentMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const currentMonthEarnings = currentMonthEarningsResult[0]?.total || 0;

    const prevMonthEarningsResult = await Request.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(workerId),
          status: "completed",
          amount: { $ne: null },
          createdAt: { $gte: startOfPrevMonth, $lt: startOfCurrentMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const prevMonthEarnings = prevMonthEarningsResult[0]?.total || 0;

    let earningsChange = 0;
    if (prevMonthEarnings > 0) {
      earningsChange = Math.round(((currentMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100);
    } else if (currentMonthEarnings > 0) {
      earningsChange = 100;
    }
    const earningsChangeStr = earningsChange >= 0 ? `+${earningsChange}%` : `${earningsChange}%`;

    const stats = {
      totalOrders: {
        value: currentMonthRequests,
        change: requestsChangeStr,
        period: "هذا الشهر",
      },
      employmentRate: {
        value: `${currentEmploymentRate}%`,
        change: rateChangeStr,
        period: "هذا الشهر",
      },
      totalEarnings: {
        value: currentMonthEarnings,
        currency: "ج.م",
        change: earningsChangeStr,
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
    })
      .populate("user", "name profilePic")
      .sort({ createdAt: -1 });

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

    if (status === "completed") {
      const populatedRequest = await Request.findById(request._id)
        .populate("user", "name")
        .populate("category", "name");

      const clientName = populatedRequest?.user?.name || "عميل المنصة";
      const categoryName = populatedRequest?.category?.name || "عام";

      const existingPortfolio = await Portfolio.findOne({
        worker: request.worker,
        title: request.service,
        clientName: clientName,
        source: "platform",
      });
      if (!existingPortfolio) {
        await Portfolio.create({
          worker: request.worker,
          title: request.service,
          category: categoryName,
          clientName: clientName,
          description: "تم إنجاز هذا العمل بنجاح عبر منصة أوسطى فايندر.",
          date: new Date(),
          source: "platform",
          status: "completed",
          location: request.address,
          price: request.amount || 0,
          images: request.image ? [request.image] : [],
        });
      }
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
    let filter = {};
    filter.approvalStatus = "approved";

    if (req.query.category) {
      const decodedSlug = decodeURIComponent(req.query.category);
      
      const categoryObj = await categoryModel.findOne({ slug: decodedSlug });

      if (categoryObj) {
        filter.category = categoryObj._id;
        
        delete req.query.category;
      } else {
        return res.status(200).json({
          success: true,
          results: 0,
          pagination: {},
          data: [],
        });
      }
    }

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

// ============================================
// ADMIN — WORKERS LIST WITH PAGINATION
// ============================================
// @desc    Get paginated list of workers for the admin dashboard
// @route   GET /workers/admin
// @access  Private/Admin
export const getAdminWorkers = asyncHandler(async (req, res, next) => {
  const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 15);
  const skip  = (page - 1) * limit;
  const search = (req.query.search || req.query.keyword || "").trim();

  // ── Build filter ──────────────────────────────────────────────────────────
  let filter = {};

  if (search) {
    // Match categories by name first to allow filtering by category keyword
    const matchingCategories = await categoryModel
      .find({ name: { $regex: search, $options: "i" } })
      .select("_id");

    const categoryIds = matchingCategories.map((c) => c._id);

    filter.$or = [
      { name:        { $regex: search, $options: "i" } },
      { email:       { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
      ...(categoryIds.length ? [{ category: { $in: categoryIds } }] : []),
    ];
  }

  // ── Query ─────────────────────────────────────────────────────────────────
  const [total, workers] = await Promise.all([
    workerModel.countDocuments(filter),
    workerModel
      .find(filter)
      .populate("category", "name")
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data:  workers,
    total,
    pages,
    page,
    limit,
  });
});
