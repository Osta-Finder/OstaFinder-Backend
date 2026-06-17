import asyncHandler from "express-async-handler";
import Request, { statusMap, reverseStatusMap } from "../models/request.model.js";
import Rating from "../models/rating.model.js";
import Worker from "../models/worker.model.js";
import Portfolio from "../models/portfolio.model.js";
import ApiError from "../utils/ApiError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

const getRatingMap = async (requests) => {
  const ids = requests.map((r) => r._id);
  const ratings = await Rating.find({ request: { $in: ids } }).select(
    "stars comment createdAt request"
  );
  const map = {};
  ratings.forEach((rt) => {
    map[rt.request.toString()] = {
      _id: rt._id,
      stars: rt.stars,
      comment: rt.comment,
      createdAt: rt.createdAt,
    };
  });
  return map;
};

const formatRequest = (r, rating) => ({
  _id: r._id,
  requestNumber: r._id.toString().slice(-5).toUpperCase(),
  service: r.service,
  worker: r.worker,
  user: r.user,
  date: r.date,
  address: r.address,
  amount: r.amount,
  image: r.image || null,
  status: statusMap[r.status] || r.status,
  eta: r.eta || "",
  rating: rating || null,
  description: r.description,
});

const getRequestFilter = async (req, next) => {
  if (req.user.role === "admin") return {};
  if (req.user.role === "client") return { user: req.user.id };
  if (req.user.role === "worker") return { worker: req.user.id };
  return next(new ApiError("غير مصرح لك", 403));
};

// @desc    Get all requests (own for client/worker, all for admin) with pagination
// @route   GET /requests?status=pending&page=1&limit=10
// @access  Private
export const getRequests = asyncHandler(async (req, res, next) => {
  const filter = {};
  if (req.user.role !== "admin") filter.user = req.user.id;
  if (req.query.status) {
    console.log("=== DEBUG STATUS FILTER ===");
    console.log("raw query status:", JSON.stringify(req.query.status));
    console.log("raw query status type:", typeof req.query.status);
    console.log("status length:", req.query.status.length);
    console.log("status char codes:", [...req.query.status].map(c => c.charCodeAt(0)));
    console.log("reverseStatusMap keys:", Object.keys(reverseStatusMap).map(k => JSON.stringify(k)));
    const mapped = reverseStatusMap[req.query.status];
    console.log("mapped result:", mapped);
    console.log("=== END DEBUG ===");
    if (mapped) {
      filter.status = mapped;
      delete req.query.status;
    }
  }

  const countDocuments = await Request.countDocuments(filter);

  const apiFeatures = new ApiFeatures(
    Request.find(filter).populate("worker", "name phoneNumber").populate("user", "name phoneNumber"),
    req.query
  )
    .filter()
    .sort()
    .paginate(countDocuments);

  const requests = await apiFeatures.mongooseQuery;
  const ratingMap = await getRatingMap(requests);
  const data = requests.map((r) => formatRequest(r, ratingMap[r._id.toString()]));

  res.status(200).json({
    success: true,
    count: data.length,
    pagination: apiFeatures.paginationResult,
    data,
  });
});

// @desc    Get requests assigned to the logged-in worker
// @route   GET /requests/my-worker
// @access  Private (worker only)
export const getMyWorkerRequests = asyncHandler(async (req, res, next) => {
  const requests = await Request.find({ worker: req.user.id })
    .populate("worker", "name phoneNumber")
    .populate("user", "name phoneNumber")
    .sort({ createdAt: -1 });

  const ratingMap = await getRatingMap(requests);
  const data = requests.map((r) => formatRequest(r, ratingMap[r._id.toString()]));

  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Get request stats (count by status)
// @route   GET /requests/stats
// @access  Private
export const getRequestStats = asyncHandler(async (req, res, next) => {
  const filter = await getRequestFilter(req, next);
  if (!filter) return;

  if (req.user.role === "admin" && req.query.user) {
    filter.user = req.query.user;
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
// @access  Private (owner, assigned worker, or admin)
export const getRequestById = asyncHandler(async (req, res, next) => {
  const request = await Request.findById(req.params.id)
    .populate("worker", "name phoneNumber")
    .populate("user", "name phoneNumber profilePic");

  if (!request) return next(new ApiError("الطلب غير موجود", 404));

  const isOwner = request.user._id.toString() === req.user.id;
  const isWorker = request.worker._id.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isWorker && !isAdmin) {
    return next(new ApiError("لا يمكنك الاطلاع على هذا الطلب", 403));
  }

  const rating = await Rating.findOne({ request: req.params.id }).select(
    "stars comment createdAt"
  );
  res.status(200).json({ success: true, data: formatRequest(request, rating) });
});

// @desc    Create a new request
// @route   POST /requests
// @access  Private (client only)
export const createRequest = asyncHandler(async (req, res, next) => {
  const { date, address, phoneNumber, description, category, amount, service, image } = req.body;

  const { workerId } = req.params
  const userId = req.user._id

  const workerExists = await Worker.findById(workerId);
  if (!workerExists) {
    return next(new ApiError("الصنايعي غير موجود", 404));
  }

  const finalCategory = workerExists.category || category;

  if (!finalCategory) {
    return next(new ApiError("يجب تحديد فئة الخدمة", 400));
  }

  let request = await Request.create({
    user: userId,
    worker: workerId,
    category: finalCategory,
    date,
    address,
    amount: amount || workerExists.price,
    phoneNumber,
    description,
    service,
    image: image || null,
  });

  request = await request.populate("category", "name");

  res.status(201).json({
    success: true,
    message: "تم إرسال طلب الخدمة بنجاح وفي انتظار رد الفني",
    data: request,
  });
});

// @desc    Update request status (accept, reject, complete, etc.)
// @route   PATCH /requests/:id/status
// @access  Private (assigned worker or admin)
export const updateRequestStatus = asyncHandler(async (req, res, next) => {
  const existingRequest = await Request.findById(req.params.id);
  if (!existingRequest) return next(new ApiError("الطلب غير موجود", 404));

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
    { new: true, runValidators: true }
  );

  if (req.body.status === "completed") {
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
        approvalStatus: "approved",
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
// @access  Private (owner client or admin)
export const cancelRequest = asyncHandler(async (req, res, next) => {
  const request = await Request.findById(req.params.id);
  if (!request) return next(new ApiError("الطلب غير موجود", 404));

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
