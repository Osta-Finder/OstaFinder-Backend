import jwt from 'jsonwebtoken';
import User from "../models/user.model.js"
import Worker from "../models/worker.model.js"
import AppError from '../utils/app.Error.js';


const register = async (req, res, next) => {
    let user;
    console.log("done", req.body.role);
    if (req.body.role === "worker") {
        user = await Worker.create(req.body);
    } else {
        user = await User.create(req.body);

    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({
        message: "user created sucessfully",
        user,
        accessToken,
        refreshToken,
    });
};

const login = async (req, res, next) => {
    const { emailorPhone, password, role } = req.body;
    let user;
    if (role === "worker") {
        user = await Worker.findOne({
            $or: [
                { email: emailorPhone },
                { phoneNumber: emailorPhone }
            ]
        });
    } else {
        user = await User.findOne({
            $or: [
                { email: emailorPhone },
                { phoneNumber: emailorPhone }
            ]
        });

    }
    if (!user || !(await user.comparedPassword(password))) {
        return next(new AppError("invalid credintial", 401));
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
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
    user.accessToken = accessToken;
    await user.save();

    res.status(200).json({
        message: "Logged in successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber
        },
    });
};

const refreshToken = async (req, res, next) => {
    console.log("refreshToken");
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({
            message: "token expired"
        });
    }
    const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRSH);

    const user = await User.findById(decodedToken.id);

    if (!user || user.refreshToken !== refreshToken) {
        return next(new AppError("invalid refresh token", 401));
    }

    const newAccessToken = user.generateAccessToken();

    res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
};

const logout = (req, res) => {
    console.log("logout");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
};

const getMe = async (req, res) => {
    console.log(req.user);

    const user = await User.findById(req.user.id);
    console.log(user);
    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber
    });
};


export default { register, login, logout, getMe, refreshToken };