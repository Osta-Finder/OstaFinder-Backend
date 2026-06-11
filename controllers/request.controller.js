import Request from "../models/request.model.js";
import Rating from "../models/rating.model.js";
import User from "../models/user.model.js";
import Worker from "../models/worker.model.js";
import Portfolio from "../models/portfolio.model.js";
import ApiError from "../utils/ApiError.js";

const statusMap = {
  pending: "معلقة",
  accepted: "مقبولة",
  in_progress: "قيد التنفيذ",
  completed: "مكتملة",
  rejected: "مرفوضة",
  cancelled: "ملغية",
};

const reverseStatusMap = {
  الكل: null,
  معلقة: "pending",
  مقبولة: "accepted",
  "قيد التنفيذ": "in_progress",
  مكتملة: "completed",
  مرفوضة: "rejected",
  ملغية: "cancelled",
};

// @desc    Get all requests with optional status filter
// @route   GET /requests?status=pending
// @access  Private
export const getRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      const mappedStatus = reverseStatusMap[req.query.status];
      if (mappedStatus) {
        filter.status = mappedStatus;
      }
    }
    if (req.query.user) {
      filter.user = req.query.user;
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
      rating: ratingMap[r._id.toString()] || null,
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Get requests for the logged-in worker
// @route   GET /requests/my-worker
// @access  Private (worker)
export const getMyWorkerRequests = async (req, res, next) => {
  try {
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
      rating: ratingMap[r._id.toString()] || null,
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Get request stats (count by status)
// @route   GET /requests/stats
// @access  Private
export const getRequestStats = async (req, res, next) => {
  try {
    let filter = {};

    if (req.query.user) {
      filter.user = req.query.user;
    } else {
      const user = await User.findById(req.user.id);
      if (user && user.role === "admin") {
        // admin sees all
      } else if (user && user.role === "client") {
        filter.user = req.user.id;
      } else {
        const worker = await Worker.findById(req.user.id);
        if (worker) {
          return next(new ApiError("الصنايعي لا يمكنه عرض الإحصائيات", 403));
        }
        filter.user = req.user.id;
      }
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
  } catch (err) {
    next(err);
  }
};

// @desc    Get single request by ID
// @route   GET /requests/:id
// @access  Private
export const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("worker", "name phoneNumber")
      .populate("user", "name phoneNumber");

    if (!request) {
      return next(new ApiError("الطلب غير موجود", 404));
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
        rating: rating || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new request
// @route   POST /requests
// @access  Private
export const createRequest = async (req, res, next) => {
  try {
    const { service, worker, date, address, amount } = req.body;

    const workerExists = await Worker.findById(worker);
    if (!workerExists) {
      return next(new ApiError("الصنايعي غير موجود", 404));
    }

    const request = await Request.create({
      service,
      worker,
      user: req.query.user || req.user.id,
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
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update request status
// @route   PATCH /requests/:id/status
// @access  Private
export const updateRequestStatus = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );

    if (!request) {
      return next(new ApiError("الطلب غير موجود", 404));
    }

    // Auto-create portfolio item when a request is completed.
    // This is the SINGLE canonical place where this logic lives.
    if (req.body.status === "completed") {
      const existingPortfolio = await Portfolio.findOne({
        worker: request.worker,
        title: request.serviceTitle,
        clientName: request.clientName,
        source: "platform",
      });
      if (!existingPortfolio) {
        await Portfolio.create({
          worker: request.worker,
          title: request.serviceTitle,
          category: request.category,
          clientName: request.clientName,
          description: `تم إنجاز هذا العمل بنجاح عبر منصة أوسطى فايندر.`,
          date: new Date(),
          source: "platform",
          status: "completed",
          location: request.location,
          price: request.price || 0,
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
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a request (only if pending)
// @route   PATCH /requests/:id/cancel
// @access  Private
export const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return next(new ApiError("الطلب غير موجود", 404));
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
  } catch (err) {
    next(err);
  }
};
