import workerModel from "../models/worker.model.js";
import WorkerService from "../models/workerService.model.js";
import WorkerPortfolio from "../models/workerPortfolio.model.js";
import WorkerReview from "../models/workerReview.model.js";
import Order from "../models/reqOrder.model.js";
import ApiError from "../utils/ApiError.js";

// ─────────────────────────────────────────────
// @desc    Get full worker profile page data
// @route   GET /workers/:id/profile
// @access  Public
// ─────────────────────────────────────────────
export const getWorkerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const worker = await workerModel
      .findById(id)
      .select("-password -refreshToken")
      .populate("category", "name icon");

    if (!worker) {
      return next(new ApiError("الفني غير موجود", 404));
    }

    // جلب الخدمات المتاحة للحجز
    const services = await WorkerService.find({ worker: id, isActive: true })
      .populate("category", "name icon")
      .sort({ createdAt: -1 });

    // جلب معرض الأعمال السابقة
    const portfolio = await WorkerPortfolio.find({ worker: id }).sort({
      createdAt: -1,
    });

    // جلب تقييمات العملاء (أحدث 10)
    const reviews = await WorkerReview.find({ worker: id })
      .populate("customer", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        worker: {
          _id: worker._id,
          name: worker.name,
          email: worker.email,
          phoneNumber: worker.phoneNumber,
          category: worker.category,
          bio: worker.bio,
          yearsOfExperience: worker.yearsOfExperience,
          totalOrders: worker.totalOrders,
          workingHours: worker.workingHours,
          address: worker.address,
          profileImage: worker.profileImage,
          tags: worker.tags,
          rating: worker.rating,
          ratingsCount: worker.ratingsCount,
          isOnline: worker.isOnline,
        },
        services,
        portfolio,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @desc    Update worker own profile
// @route   PUT /workers/:id/profile
// @access  Private (worker only — own profile)
// ─────────────────────────────────────────────
// export const updateWorkerProfile = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     // الفني يقدر يعدل بروفايله بس
//     if (req.user.id !== id) {
//       return next(new ApiError("غير مصرح لك بتعديل هذا الملف الشخصي", 403));
//     }

//     const allowedFields = [
//       "bio",
//       "yearsOfExperience",
//       "workingHours",
//       "address",
//       "profileImage",
//       "tags",
//       "isOnline",
//       "price",
//     ];

//     const updateData = {};
//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = req.body[field];
//       }
//     });

//     const worker = await workerModel
//       .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
//       .select("-password -refreshToken")
//       .populate("category", "name icon");

//     if (!worker) {
//       return next(new ApiError("الفني غير موجود", 404));
//     }

//     res.status(200).json({ success: true, data: worker });
//   } catch (err) {
//     next(err);
//   }
// };

// ─────────────────────────────────────────────────────────────
//  WORKER SERVICES
// ─────────────────────────────────────────────────────────────

// @desc    Get all services for a worker
// @route   GET /workers/:id/services
// @access  Public
export const getWorkerServices = async (req, res, next) => {
  try {
    const services = await WorkerService.find({
      worker: req.params.id,
      isActive: true,
    })
      .populate("category", "name icon")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a service to worker profile
// @route   POST /workers/:id/services
// @access  Private (worker only — own profile)
// export const addWorkerService = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (req.user.id !== id) {
//       return next(new ApiError("غير مصرح لك بإضافة خدمة لهذا الفني", 403));
//     }

//     const { title, description, price, category, icon } = req.body;

//     const service = await WorkerService.create({
//       worker: id,
//       title,
//       description,
//       price,
//       category,
//       icon,
//     });

//     const populated = await service.populate("category", "name icon");

//     res.status(201).json({ success: true, data: populated });
//   } catch (err) {
//     next(err);
//   }
// };

// @desc    Update a service
// @route   PUT /workers/:id/services/:serviceId
// @access  Private (worker only — own service)
// export const updateWorkerService = async (req, res, next) => {
//   try {
//     const { id, serviceId } = req.params;

//     if (req.user.id !== id) {
//       return next(new ApiError("غير مصرح لك بتعديل هذه الخدمة", 403));
//     }

//     const service = await WorkerService.findOneAndUpdate(
//       { _id: serviceId, worker: id },
//       req.body,
//       { new: true, runValidators: true }
//     ).populate("category", "name icon");

//     if (!service) {
//       return next(new ApiError("الخدمة غير موجودة", 404));
//     }

//     res.status(200).json({ success: true, data: service });
//   } catch (err) {
//     next(err);
//   }
// };

// @desc    Delete (deactivate) a service
// @route   DELETE /workers/:id/services/:serviceId
// @access  Private (worker only — own service)
// export const deleteWorkerService = async (req, res, next) => {
//   try {
//     const { id, serviceId } = req.params;

//     if (req.user.id !== id) {
//       return next(new ApiError("غير مصرح لك بحذف هذه الخدمة", 403));
//     }

//     const service = await WorkerService.findOneAndUpdate(
//       { _id: serviceId, worker: id },
//       { isActive: false },
//       { new: true }
//     );

//     if (!service) {
//       return next(new ApiError("الخدمة غير موجودة", 404));
//     }

//     res.status(200).json({ success: true, message: "تم إخفاء الخدمة بنجاح" });
//   } catch (err) {
//     next(err);
//   }
// };

// ─────────────────────────────────────────────────────────────
//  PORTFOLIO
// ─────────────────────────────────────────────────────────────

// @desc    Get portfolio items for a worker
// @route   GET /workers/:id/portfolio
// @access  Public
export const getWorkerPortfolio = async (req, res, next) => {
  try {
    const portfolio = await WorkerPortfolio.find({
      worker: req.params.id,
    }).sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: portfolio.length, data: portfolio });
  } catch (err) {
    next(err);
  }
};

// @desc    Add portfolio item
// @route   POST /workers/:id/portfolio
// @access  Private (worker only — own profile)
// export const addPortfolioItem = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (req.user.id !== id) {
//       return next(new ApiError("غير مصرح لك بإضافة عمل لهذا الفني", 403));
//     }

//     const { title, imageUrl, description } = req.body;

//     const item = await WorkerPortfolio.create({
//       worker: id,
//       title,
//       imageUrl,
//       description,
//     });

//     res.status(201).json({ success: true, data: item });
//   } catch (err) {
//     next(err);
//   }
// };

// @desc    Delete portfolio item
// @route   DELETE /workers/:id/portfolio/:itemId
// @access  Private (worker only — own portfolio)
// export const deletePortfolioItem = async (req, res, next) => {
//   try {
//     const { id, itemId } = req.params;

//     if (req.user.id !== id) {
//       return next(new ApiError("غير مصرح لك بحذف هذا العمل", 403));
//     }

//     const item = await WorkerPortfolio.findOneAndDelete({
//       _id: itemId,
//       worker: id,
//     });

//     if (!item) {
//       return next(new ApiError("العمل غير موجود", 404));
//     }

//     res.status(200).json({ success: true, message: "تم حذف العمل بنجاح" });
//   } catch (err) {
//     next(err);
//   }
// };

// ─────────────────────────────────────────────────────────────
//  REVIEWS
// ─────────────────────────────────────────────────────────────

// @desc    Get all reviews for a worker
// @route   GET /workers/:id/reviews
// @access  Public
export const getWorkerReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await WorkerReview.countDocuments({ worker: req.params.id });

    const reviews = await WorkerReview.find({ worker: req.params.id })
      .populate("customer", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      currentPage: page,
      numberOfPages: Math.ceil(total / limit),
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review for a worker (must have completed order with this worker)
// @route   POST /workers/:id/reviews
// @access  Private (client only)
export const addWorkerReview = async (req, res, next) => {
  try {
    const workerId = req.params.id;
    const customerId = req.user.id;
    const { orderId, stars, comment } = req.body;

    // التحقق إن الطلب موجود ومكتمل وبينتمي للعميل والفني
    const order = await Order.findOne({
      _id: orderId,
      customer: customerId,
      worker: workerId,
      status: "completed",
    });

    if (!order) {
      return next(
        new ApiError(
          "لا يمكن التقييم: لا يوجد طلب مكتمل بينك وبين هذا الفني أو تم التقييم مسبقًا",
          400
        )
      );
    }

    // التحقق إن الطلب ده محدش قيّم بيه قبل كده
    const existing = await WorkerReview.findOne({ order: orderId });
    if (existing) {
      return next(new ApiError("تم تقييم هذا الطلب من قبل", 400));
    }

    const review = await WorkerReview.create({
      worker: workerId,
      customer: customerId,
      order: orderId,
      stars,
      comment,
    });

    const populated = await review.populate("customer", "name profileImage");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a review
// @route   DELETE /workers/:id/reviews/:reviewId
// @access  Private (review owner or admin)
// export const deleteWorkerReview = async (req, res, next) => {
//   try {
//     const review = await WorkerReview.findById(req.params.reviewId);

//     if (!review) {
//       return next(new ApiError("التقييم غير موجود", 404));
//     }

//     // صاحب التقييم بس أو الأدمن يقدر يحذفه
//     if (
//       review.customer.toString() !== req.user.id &&
//       req.user.role !== "admin"
//     ) {
//       return next(new ApiError("غير مصرح لك بحذف هذا التقييم", 403));
//     }

//     await WorkerReview.findOneAndDelete({ _id: req.params.reviewId });

//     res.status(200).json({ success: true, message: "تم حذف التقييم بنجاح" });
//   } catch (err) {
//     next(err);
//   }
// };

// ─────────────────────────────────────────────────────────────
//  BOOKING (Quick Service Request)
// ─────────────────────────────────────────────────────────────

// @desc    Book a service from worker profile (quick booking form)
// @route   POST /workers/:id/book
// @access  Private (client only)
export const bookWorkerService = async (req, res, next) => {
  try {
    const workerId = req.params.id;
    const customerId = req.user.id;

    const { serviceId, urgency, location, notes, phone } = req.body;

    // التحقق إن الفني موجود
    const worker = await workerModel.findById(workerId);
    if (!worker) {
      return next(new ApiError("الفني غير موجود", 404));
    }

    // التحقق إن الخدمة موجودة وتابعة للفني
    const service = await WorkerService.findOne({
      _id: serviceId,
      worker: workerId,
      isActive: true,
    }).populate("category");

    if (!service) {
      return next(new ApiError("الخدمة غير موجودة أو غير متاحة", 404));
    }

    // إنشاء الطلب
    const order = await Order.create({
      customer: customerId,
      worker: workerId,
      category: service.category._id,
      description: notes || service.title,
      phone: phone,
      preferredTime: req.body.preferredTime || new Date(),
      location,
      urgency: urgency || "normal",
    });

    // تحديث عداد الطلبات للفني
    await workerModel.findByIdAndUpdate(workerId, {
      $inc: { totalOrders: 1 },
    });

    res.status(201).json({
      success: true,
      message: "تم إرسال طلب الخدمة بنجاح وفي انتظار رد الفني",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
