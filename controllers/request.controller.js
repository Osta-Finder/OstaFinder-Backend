import asyncHandler from "express-async-handler";

import Request from "../models/request.model.js";
import Rating from "../models/rating.model.js";
import Worker from "../models/worker.model.js";
import Portfolio from "../models/portfolio.model.js";
import ApiError from "../utils/ApiError.js";

const statusMap = {
  pending: "معلقة",
  accepted: "مقبولة",
  on_the_way: "في الطريق",
  in_progress: "قيد التنفيذ",
  completed: "مكتملة",
  rejected: "مرفوضة",
  cancelled: "ملغية",
};

const reverseStatusMap = {
  الكل: null,
  معلقة: "pending",
  مقبولة: "accepted",
  "في الطريق": "on_the_way",
  "قيد التنفيذ": "in_progress",
  مكتملة: "completed",
  مرفوضة: "rejected",
  ملغية: "cancelled",
};

// @desc    Get all requests with optional status filter
// @route   GET /requests?status=pending
// @access  Private
export const getRequests = asyncHandler(async (req, res, next) => {
    const filter = {};
    if (req.user.role !== "admin") {
      filter.user = req.user.id;
    }
    if (req.query.status) {
      const mappedStatus = reverseStatusMap[req.query.status];
      if (mappedStatus) {
        filter.status = mappedStatus;
      }
    }
    const requests = await Request.find(filter)
      .populate("worker", "name phoneNumber")
      .populate("user", "name phoneNumber")
      .sort({ createdAt: -1 });

    const requestIds = requests.map((r) => r._id);
    const ratings = await Rating.find({ request: { $in: requestIds } }).select("stars comment createdAt request");
    const ratingMap = {};
    ratings.forEach((rt) => {
      ratingMap[rt.request.toString()] = { _id: rt._id, stars: rt.stars, comment: rt.comment, createdAt: rt.createdAt };
    });

    const result = requests.map((r) => ({
      _id: r._id,
      requestNumber: r.requestNumber,
      service: r.service,
      worker: r.worker,
      user: r.user,
      date: r.date,
      amount: r.amount,
      status: statusMap[r.status] || r.status,
      eta: r.eta || "",
      rating: ratingMap[r._id.toString()] || null,
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
});

// @desc    Get requests for the logged-in worker
// @route   GET /requests/my-worker
// @access  Private (worker)
export const getMyWorkerRequests = asyncHandler(async (req, res, next) => {
    const requests = await Request.find({ worker: req.user.id })
      .populate("worker", "name phoneNumber")
      .populate("user", "name phoneNumber")
      .sort({ createdAt: -1 });

    const requestIds = requests.map((r) => r._id);
    const ratings = await Rating.find({ request: { $in: requestIds } }).select("stars comment createdAt request");
    const ratingMap = {};
    ratings.forEach((rt) => {
      ratingMap[rt.request.toString()] = { _id: rt._id, stars: rt.stars, comment: rt.comment, createdAt: rt.createdAt };
    });

    const result = requests.map((r) => ({
      _id: r._id,
      requestNumber: r.requestNumber,
      service: r.service,
      worker: r.worker,
      user: r.user,
      date: r.date,
      address: r.address,
      amount: r.amount,
      status: statusMap[r.status] || r.status,
      eta: r.eta || "",
      rating: ratingMap[r._id.toString()] || null,
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
});

// @desc    Get request stats (count by status)
// @route   GET /requests/stats
// @access  Private
export const getRequestStats = asyncHandler(async (req, res, next) => {
    let filter = {};

    if (req.user.role === "admin") {
      // admin sees all, can filter by ?user=
      if (req.query.user) {
        filter.user = req.query.user;
      }
    } else if (req.user.role === "client") {
      filter.user = req.user.id;
    } else {
      return next(new ApiError("الصنايعي لا يمكنه عرض الإحصائيات", 403));
    }

    const all = await Request.countDocuments(filter);
    const pending = await Request.countDocuments({ ...filter, status: "pending" });
    const accepted = await Request.countDocuments({ ...filter, status: "accepted" });
    const inProgress = await Request.countDocuments({ ...filter, status: "in_progress" });
    const completed = await Request.countDocuments({ ...filter, status: "completed" });
    const rejected = await Request.countDocuments({ ...filter, status: "rejected" });
    const cancelled = await Request.countDocuments({ ...filter, status: "cancelled" });

    res.status(200).json({
      success: true,
      data: {
        الكل: all,
        معلقة: pending,
        مقبولة: accepted,
        "قيد التنفيذ": inProgress,
        مكتملة: completed,
        مرفوضة: rejected,
        ملغية: cancelled,
      },
    });
});

// @desc    Get single request by ID
// @route   GET /requests/:id
// @access  Private
export const getRequestById = asyncHandler(async (req, res, next) => {
    const request = await Request.findById(req.params.id)
      .populate("worker", "name phoneNumber")
      .populate("user", "name phoneNumber");

    if (!request) {
      return next(new ApiError("الطلب غير موجود", 404));
    }

    const isOwner = request.user._id.toString() === req.user.id;
    const isWorker = request.worker._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isWorker && !isAdmin) {
      return next(new ApiError("لا يمكنك الاطلاع على هذا الطلب", 403));
    }

    const rating = await Rating.findOne({ request: req.params.id }).select("stars comment createdAt");

    res.status(200).json({
      success: true,
      data: {
        _id: request._id,
        requestNumber: request.requestNumber,
        service: request.service,
        worker: request.worker,
        user: request.user,
        date: request.date,
        address: request.address,
        amount: request.amount,
        status: statusMap[request.status] || request.status,
        eta: request.eta || "",
        rating: rating || null,
      },
    });
});

// @desc    Create a new request
// @route   POST /requests
// @access  Private
export const createRequest = asyncHandler(async (req, res, next) => {
    const { service, worker, date, address, amount } = req.body;

    const workerExists = await Worker.findById(worker);
    if (!workerExists) {
      return next(new ApiError("الصنايعي غير موجود", 404));
    }

    const request = await Request.create({
      service,
      worker,
      user: req.user.id,
      date,
      address,
      amount,
    });

    const populated = await request.populate("worker", "name phoneNumber");

    res.status(201).json({
      success: true,
      data: {
        _id: populated._id,
        requestNumber: populated.requestNumber,
        service: populated.service,
        worker: populated.worker,
        date: populated.date,
        address: populated.address,
        amount: populated.amount,
        status: statusMap[populated.status],
        eta: populated.eta || "",
      },
    });
});

// @desc    Update request status
// @route   PATCH /requests/:id/status
// @access  Private
export const updateRequestStatus = asyncHandler(async (req, res, next) => {
    const existingRequest = await Request.findById(req.params.id);
    if (!existingRequest) {
      return next(new ApiError("الطلب غير موجود", 404));
    }

    const isWorker = existingRequest.worker.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isWorker && !isAdmin) {
      return next(new ApiError("لا يمكنك تعديل حالة هذا الطلب", 403));
    }

    const updateFields = {};
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.eta !== undefined) updateFields.eta = req.body.eta;

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    );

    // Auto-create portfolio item when a request is completed.
    if (req.body.status === "completed") {
      const existingPortfolio = await Portfolio.findOne({
        worker: request.worker,
        title: request.service,
        clientName: request.clientName,
        source: "platform",
      });
      if (!existingPortfolio) {
        await Portfolio.create({
          worker: request.worker,
          title: request.service,
          category: request.category,
          clientName: request.clientName,
          description: `تم إنجاز هذا العمل بنجاح عبر منصة أوسطى فايندر.`,
          date: new Date(),
          source: "platform",
          status: "completed",
          location: request.address,
          price: request.amount || 0,
          images: [],
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        _id: request._id,
        requestNumber: request.requestNumber,
        status: statusMap[request.status],
        eta: request.eta || "",
      },
    });
});

// @desc    Cancel a request (only if pending)
// @route   PATCH /requests/:id/cancel
// @access  Private
export const cancelRequest = asyncHandler(async (req, res, next) => {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return next(new ApiError("الطلب غير موجود", 404));
    }

    const isOwner = request.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return next(new ApiError("لا يمكنك إلغاء هذا الطلب", 403));
    }

    if (request.status !== "pending") {
      return next(new ApiError("لا يمكن إلغاء طلب غير معلق", 400));
    }

    request.status = "cancelled";
    await request.save();

    res.status(200).json({
      success: true,
      data: {
        _id: request._id,
        requestNumber: request.requestNumber,
        status: statusMap[request.status],
      },
    });
});
