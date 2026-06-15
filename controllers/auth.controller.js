import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Worker from "../models/worker.model.js";
import ApiError from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/authToken.js";

const buildAuthUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  category: user.category,
  price: user.price,
  rating: user.rating,
  isOnline: user.isOnline,
  isOnboarded: user.isOnboarded,
  onboardingCompleted: user.onboardingCompleted,
  approvalStatus: user.approvalStatus,
  approvedAt: user.approvedAt,
  yearsOfExperience: user.yearsOfExperience,
  bio: user.bio,
  nationalId: user.nationalId,
  certifications: user.certifications,
  addresses: user.addresses || [],
  profilePic: user.profilePic,
});

const register = asyncHandler(async (req, res, next) => {
  let user;

  if (req.body.role === "worker") {
    user = await Worker.create(req.body);
  } else {
    user = await User.create(req.body);
  }

  res.status(201).json({
    message: "user created sucessfully",
    user: buildAuthUser(user),
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { emailorPhone, password, role } = req.body;
  let user;
  if (role === "worker") {
    user = await Worker.findOne({
      $or: [{ email: emailorPhone }, { phoneNumber: emailorPhone }],
    });
  } else {
    user = await User.findOne({
      $or: [{ email: emailorPhone }, { phoneNumber: emailorPhone }],
    });
  }
  if (!user || !(await user.comparedPassword(password))) {
    return next(new ApiError("Invalid credentials", 401));
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    message: "Logged in successfully",
    user: buildAuthUser(user),
  });
});

const refreshTokenHandler = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "token expired",
    });
  }
  const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

  let user;

  if (decodedToken.role === "worker") {
    user = await Worker.findById(decodedToken.id);
  } else {
    user = await User.findById(decodedToken.id);
  }

  if (!user || user.refreshToken !== refreshToken) {
    return next(new ApiError("invalid refresh token", 401));
  }

  const newAccessToken = generateAccessToken(user);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.json({ message: "Token refreshed" });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  req.user.refreshToken = null;
  await req.user.save();
  res.json({ message: "Logged out" });
});

const getMe = asyncHandler(async (req, res) => {
  //   const user = await User.findById(req.user.id);
  //   console.log(req.user);
  res.json(buildAuthUser(req.user));
});

const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "email",
    "phoneNumber",
    "addresses",
    "profilePic",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  await req.user.save();

  res.json({
    message: "User updated successfully",
    user: buildAuthUser(req.user),
  });
});

// Desc    Change password
// Route   POST /auth/change-password
// Access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // determine user model based on role
  let user;
  if (req.user.role === "worker") {
    user = await Worker.findById(req.user._id)
  } else {
    user = await User.findById(req.user._id)
  }
  if (!user) {
    return next(new ApiError("لا يوجد مستخدم", 404));
  }

  // verify current password
  const isMatch = await user.comparedPassword(currentPassword);
  if (!isMatch) {
    return next(new ApiError("كلمة المرور الحالية غير صحيحة", 401));
  }

  // update to new password
  user.password = newPassword;

  // generate new tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
})

export default { register, login, logout, getMe, refreshTokenHandler, changePassword, updateMe };

