import workerModel from "../models/worker.model.js";
import WorkerService from "../models/workerService.model.js";
import WorkerPortfolio from "../models/workerPortfolio.model.js";
import WorkerReview from "../models/workerReview.model.js";
import Order from "../models/reqOrder.model.js";
import ApiError from "../utils/ApiError.js";

// ─────────────────────────────────────────────
// GET /workers/:id/profile
// جيب كل بيانات صفحة الفني دفعة واحدة
// ─────────────────────────────────────────────
export const getWorkerProfile = async (req, res, next) => {
  try {
    const worker = await workerModel
      .findById(req.params.id)
      .select("-password -refreshToken")
      .populate("category", "name icon");

    if (!worker) return next(new ApiError("الفني غير موجود", 404));

    const [services, portfolio, reviews] = await Promise.all([
      WorkerService.find({ worker: req.params.id, isActive: true })
        .populate("category", "name icon")
        .sort({ createdAt: -1 }),
      WorkerPortfolio.find({ worker: req.params.id }).sort({ createdAt: -1 }),
      WorkerReview.find({ worker: req.params.id })
        .populate("customer", "name profileImage")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: { worker, services, portfolio, reviews },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PUT /workers/:id/profile
// الفني يعدل بروفايله
// ─────────────────────────────────────────────
export const updateWorkerProfile = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(new ApiError("غير مصرح لك بتعديل هذا الملف الشخصي", 403));

    const allowed = ["bio", "yearsOfExperience", "workingHours", "address", "profileImage", "tags", "isOnline", "price"];
    const update = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const worker = await workerModel
      .findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .select("-password -refreshToken")
      .populate("category", "name icon");

    if (!worker) return next(new ApiError("الفني غير موجود", 404));

    res.status(200).json({ success: true, data: worker });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────

export const getWorkerServices = async (req, res, next) => {
  try {
    const services = await WorkerService.find({ worker: req.params.id, isActive: true })
      .populate("category", "name icon")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) { next(err); }
};

export const addWorkerService = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(new ApiError("غير مصرح لك", 403));

    const service = await WorkerService.create({ worker: req.params.id, ...req.body });
    const populated = await service.populate("category", "name icon");
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

export const updateWorkerService = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(new ApiError("غير مصرح لك", 403));

    const service = await WorkerService.findOneAndUpdate(
      { _id: req.params.serviceId, worker: req.params.id },
      req.body,
      { new: true, runValidators: true }
    ).populate("category", "name icon");

    if (!service) return next(new ApiError("الخدمة غير موجودة", 404));
    res.status(200).json({ success: true, data: service });
  } catch (err) { next(err); }
};

export const deleteWorkerService = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(new ApiError("غير مصرح لك", 403));

    const service = await WorkerService.findOneAndUpdate(
      { _id: req.params.serviceId, worker: req.params.id },
      { isActive: false },
      { new: true }
    );
    if (!service) return next(new ApiError("الخدمة غير موجودة", 404));
    res.status(200).json({ success: true, message: "تم إخفاء الخدمة" });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────

export const getWorkerPortfolio = async (req, res, next) => {
  try {
    const portfolio = await WorkerPortfolio.find({ worker: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: portfolio.length, data: portfolio });
  } catch (err) { next(err); }
};

export const addPortfolioItem = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(new ApiError("غير مصرح لك", 403));

    const item = await WorkerPortfolio.create({ worker: req.params.id, ...req.body });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

export const deletePortfolioItem = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return next(new ApiError("غير مصرح لك", 403));

    const item = await WorkerPortfolio.findOneAndDelete({ _id: req.params.itemId, worker: req.params.id });
    if (!item) return next(new ApiError("العمل غير موجود", 404));
    res.status(200).json({ success: true, message: "تم الحذف" });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────

export const getWorkerReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await WorkerReview.countDocuments({ worker: req.params.id });
    const reviews = await WorkerReview.find({ worker: req.params.id })
      .populate("customer", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    res.status(200).json({
      success: true, total, currentPage: page,
      numberOfPages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (err) { next(err); }
};

export const addWorkerReview = async (req, res, next) => {
  try {
    const { orderId, stars, comment } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.id,
      worker: req.params.id,
      status: "completed",
    });
    if (!order) return next(new ApiError("لا يوجد طلب مكتمل بينك وبين هذا الفني", 400));

    const existing = await WorkerReview.findOne({ order: orderId });
    if (existing) return next(new ApiError("تم تقييم هذا الطلب من قبل", 400));

    const review = await WorkerReview.create({
      worker: req.params.id,
      customer: req.user.id,
      order: orderId,
      stars,
      comment,
    });
    const populated = await review.populate("customer", "name profileImage");
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

export const deleteWorkerReview = async (req, res, next) => {
  try {
    const review = await WorkerReview.findById(req.params.reviewId);
    if (!review) return next(new ApiError("التقييم غير موجود", 404));

    if (review.customer.toString() !== req.user.id && req.user.role !== "admin")
      return next(new ApiError("غير مصرح لك", 403));

    await WorkerReview.findOneAndDelete({ _id: req.params.reviewId });
    res.status(200).json({ success: true, message: "تم حذف التقييم" });
  } catch (err) { next(err); }
};
