import mongoose from "mongoose";
import Worker from "../models/worker.model.js";
import Portfolio from "../models/portfolio.model.js";
import Service from "../models/service.model.js";
import Rating from "../models/rating.model.js";
import Request from "../models/request.model.js";


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================
// PUBLIC WORKER PROFILE
// ============================================
export const getWorkerPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker id",
      });
    }

    const worker = await Worker.findById(id)
      .select("-password -refreshToken")
      .populate("category");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// PUBLIC WORKER SERVICES
// ============================================
export const getWorkerPublicServices = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker id",
      });
    }

    const services = await Service.find({
      worker: id,
      status: "active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// PUBLIC WORKER WORKS
// ============================================
export const getWorkerPublicWorks = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker id",
      });
    }

    const works = await Portfolio.find({
      worker: id,
      $or: [
        { approvalStatus: "approved" },
        { source: "platform" }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: works.length,
      data: works,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// PUBLIC WORKER REVIEWS
// ============================================
export const getWorkerPublicReviews = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker id",
      });
    }

    const requests = await Request.find({ worker: id }).select("_id");
    const requestIds = requests.map((r) => r._id);

    const reviews = await Rating.find({
      request: { $in: requestIds },
    })
      .populate("user", "name image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};