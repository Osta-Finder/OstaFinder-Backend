import asyncHandler from "express-async-handler";

import Rating from "../models/rating.model.js";
import Request from "../models/request.model.js";
import ApiError from "../utils/ApiError.js";

// @desc    Create rating for a request
// @route   POST /requests/:id/rating
// @access  Private
export const createRating = asyncHandler(async (req, res, next) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return next(new ApiError("الطلب غير موجود", 404));
    }
    if (request.status !== "completed") {
      return next(new ApiError("لا يمكن تقييم طلب غير مكتمل", 400));
    }

    if (request.user.toString() !== req.user.id) {
      return next(new ApiError("فقط صاحب الطلب يمكنه التقييم", 403));
    }

    const existing = await Rating.findOne({ request: req.params.id });
    if (existing) {
      return next(new ApiError("تم تقييم هذا الطلب من قبل", 400));
    }

    const rating = await Rating.create({
      request: req.params.id,
      user: req.user.id,
      stars: req.body.stars,
      comment: req.body.comment,
    });

    res.status(201).json({ success: true, data: rating });
});

// @desc    Get rating for a request
// @route   GET /requests/:id/rating
// @access  Private
export const getRating = asyncHandler(async (req, res, next) => {

    const rating = await Rating.findOne({ request: req.params.id })
      .populate("user", "name");

    if (!rating) {
      return next(new ApiError("لا يوجد تقييم لهذا الطلب", 404));
    }

    res.status(200).json({ success: true, data: rating });
});

// @desc    Update rating for a request
// @route   PATCH /requests/:id/rating
// @access  Private
export const updateRating = asyncHandler(async (req, res, next) => {
    let rating = await Rating.findOne({ request: req.params.id });
    if (!rating) {
      return next(new ApiError("لا يوجد تقييم لهذا الطلب", 404));
    }

    if (rating.user.toString() !== req.user.id) {
      return next(new ApiError("لا يمكنك تعديل تقييم غيرك", 403));
    }

    if (req.body.stars !== undefined) rating.stars = req.body.stars;
    if (req.body.comment !== undefined) rating.comment = req.body.comment;
    await rating.save();

    res.status(200).json({ success: true, data: rating });
});

// @desc    Delete rating for a request
// @route   DELETE /requests/:id/rating
// @access  Private
export const deleteRating = asyncHandler(async (req, res, next) => {
    const rating = await Rating.findOne({ request: req.params.id });
    if (!rating) {
      return next(new ApiError("لا يوجد تقييم لهذا الطلب", 404));
    }

    if (rating.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ApiError("لا يمكنك حذف تقييم غيرك", 403));
    }

    await Rating.findByIdAndDelete(rating._id);

    res.status(200).json({ success: true, message: "تم حذف التقييم بنجاح" });
});
