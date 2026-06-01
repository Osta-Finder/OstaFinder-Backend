import Request from "../models/request.model.js";
import Worker from "../models/worker.model.js";
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

    const result = requests.map((r) => ({
      _id: r._id,
      requestNumber: r.requestNumber,
      service: r.service,
      worker: r.worker,
      user: r.user,
      date: r.date,
      amount: r.amount,
      status: statusMap[r.status] || r.status,
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

    const result = requests.map((r) => ({
      _id: r._id,
      requestNumber: r.requestNumber,
      service: r.service,
      worker: r.worker,
      user: r.user,
      date: r.date,
      amount: r.amount,
      status: statusMap[r.status] || r.status,
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
    const all = await Request.countDocuments();
    const pending = await Request.countDocuments({ status: "pending" });
    const accepted = await Request.countDocuments({ status: "accepted" });
    const in_progress = await Request.countDocuments({ status: "in_progress" });
    const completed = await Request.countDocuments({ status: "completed" });
    const rejected = await Request.countDocuments({ status: "rejected" });
    const cancelled = await Request.countDocuments({ status: "cancelled" });

    res.status(200).json({
      success: true,
      data: {
        الكل: all,
        معلقة: pending,
        مقبولة: accepted,
        "قيد التنفيذ": in_progress,
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

    res.status(200).json({
      success: true,
      data: {
        _id: request._id,
        requestNumber: request.requestNumber,
        service: request.service,
        worker: request.worker,
        user: request.user,
        date: request.date,
        amount: request.amount,
        status: statusMap[request.status] || request.status,
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
    const { service, worker, date, amount } = req.body;

    const workerExists = await Worker.findById(worker);
    if (!workerExists) {
      return next(new ApiError("الصنايعي غير موجود", 404));
    }

    const request = await Request.create({
      service,
      worker,
      user: req.query.user || req.user.id,
      date,
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
