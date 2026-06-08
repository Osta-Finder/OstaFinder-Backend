import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import Worker from "../models/worker.model.js";

// @DESC protect routes
export const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken;
    // console.log(token);
    if (!token) {
      return next( new ApiError( "غير مصرح لك بالوصول إلى هذا المسار، يرجى تسجيل الدخول أولاً", 401,),);
    }
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check if user still exists

    let currentUser;
    if (decoded.role === "worker") {
      currentUser = await Worker.findById(decoded.id);
    } else {
      currentUser = await User.findById(decoded.id);
    }

    // console.log("currentUser****************", currentUser);
    if (!currentUser) {
      return next(new ApiError("المستخدم لم يعد موجود", 401));
    }

    // console.log(currentUser);

    req.user = currentUser;
    next();
  
});

// @DESC restrictTo middleware
export const restrictTo = (...roles)=>{
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ApiError("ليس لديك صلاحية للوصول إلى هذا المسار", 403));
        }
        next();
    }
}