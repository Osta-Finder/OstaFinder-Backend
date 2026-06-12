import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import User from "../models/user.model.js";
import Worker from "../models/worker.model.js";
import ApiError from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/authToken.js";


const register = asyncHandler(async (req, res, next) => {
  let user;
  //   console.log("done", req.body.role);
  if (req.body.role === "worker") {
    user = await Worker.create(req.body);
  } else {
    user = await User.create(req.body);
  }
  //   const accessToken = user.generateAccessToken();
  //   const refreshToken = user.generateRefreshToken();

  //   user.refreshToken = refreshToken;
  //   await user.save();
  res.status(201).json({
    message: "user created sucessfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
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
  //   user.accessToken = accessToken;
  await user.save();

  // console.log(req.cookies);

  res.status(200).json({
    message: "Logged in successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
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
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phoneNumber: req.user.phoneNumber,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber } = req.body;

  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  if (phoneNumber !== undefined) req.user.phoneNumber = phoneNumber;

  await req.user.save();

  res.json({
    message: "User updated successfully",
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phoneNumber: req.user.phoneNumber,
    },
  });
});

export default { register, login, logout, getMe, updateMe, refreshTokenHandler };
