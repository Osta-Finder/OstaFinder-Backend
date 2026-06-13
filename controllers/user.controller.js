import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

// @desc    Get all users (clients + admins)
// @route   GET /api/users
// @access  Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password -refreshToken");
  if (!user) return next(new ApiError("المستخدم غير موجود", 404));

  res.status(200).json({ success: true, data: user });
});

// @desc    Create user (admin)
// @route   POST /api/users
// @access  Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, phoneNumber, password, role = "client" } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return next(new ApiError("البريد الإلكتروني مستخدم بالفعل", 400));

  const user = await User.create({ name, email, phoneNumber, password, role });

  res.status(201).json({
    success: true,
    message: "تم إنشاء المستخدم بنجاح",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ApiError("المستخدم غير موجود", 404));

  // Prevent deleting own account
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ApiError("لا يمكنك حذف حسابك الخاص", 400));
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: "تم حذف المستخدم بنجاح" });
});
