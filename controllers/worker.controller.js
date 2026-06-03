import Worker from "../models/worker.model.js";
import Service from "../models/service.model.js";
import Portfolio from "../models/portfolio.model.js";
import Request from "../models/request.model.js";
import ApiError from "../utils/ApiError.js";

// ============================================
// STATS & DASHBOARD
// ============================================
export const getDashboardStats = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id; // from verifyToken

        // Calculate stats
        const totalRequests = await Request.countDocuments({ worker: workerId });
        
        // This is a basic implementation. Can be expanded for actual analytics.
        const stats = {
            totalOrders: { value: totalRequests, change: "+0%", period: "هذا الشهر" },
            employmentRate: { value: "100%", change: "+0%", period: "هذا الشهر" },
            totalEarnings: { value: 0, currency: "ج.م", change: "+0%", period: "هذا الشهر" },
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

export const getDashboardRequests = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        // Get recent requests
        const requests = await Request.find({ worker: workerId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

// ============================================
// INCOMING REQUESTS
// ============================================
export const getIncomingRequests = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const requests = await Request.find({ worker: workerId, status: { $in: ["pending", "awaiting_approval"] } })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

export const updateRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. "in_progress", "rejected"
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;

        const request = await Request.findOneAndUpdate(
            { _id: id, worker: workerId },
            { status },
            { new: true }
        );

        if (!request) {
            return next(new ApiError("Request not found", 404));
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

// ============================================
// SERVICES
// ============================================
export const getWorkerServices = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const services = await Service.find({ worker: workerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        next(error);
    }
};

export const getWorkerServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const service = await Service.findOne({ _id: id, worker: workerId });
        
        if (!service) {
            return next(new ApiError("Service not found", 404));
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

export const addWorkerService = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const { title, category, price, description, location } = req.body;

        const service = await Service.create({
            worker: workerId,
            title,
            category,
            price,
            description,
            location
        });

        res.status(201).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

export const updateWorkerService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;

        const service = await Service.findOneAndUpdate(
            { _id: id, worker: workerId },
            req.body,
            { new: true }
        );

        if (!service) {
            return next(new ApiError("Service not found", 404));
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
};

export const deleteWorkerService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;

        const service = await Service.findOneAndDelete({ _id: id, worker: workerId });

        if (!service) {
            return next(new ApiError("Service not found", 404));
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// ============================================
// PORTFOLIO / WORKS
// ============================================
export const getWorkerWorks = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const works = await Portfolio.find({ worker: workerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: works });
    } catch (error) {
        next(error);
    }
};

export const getWorkerWorkById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const work = await Portfolio.findOne({ _id: id, worker: workerId });
        
        if (!work) {
            return next(new ApiError("Work not found", 404));
        }

        res.status(200).json({ success: true, data: work });
    } catch (error) {
        next(error);
    }
};

export const addWorkerWork = async (req, res, next) => {
    try {
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;
        const { title, category, clientName, description, date, source, status, location, price } = req.body;

        const work = await Portfolio.create({
            worker: workerId,
            title,
            category,
            clientName,
            description,
            date,
            source,
            status,
            location,
            price
        });

        res.status(201).json({ success: true, data: work });
    } catch (error) {
        next(error);
    }
};

export const updateWorkerWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;

        const work = await Portfolio.findOneAndUpdate(
            { _id: id, worker: workerId },
            req.body,
            { new: true }
        );

        if (!work) {
            return next(new ApiError("Work not found", 404));
        }

        res.status(200).json({ success: true, data: work });
    } catch (error) {
        next(error);
    }
};

export const deleteWorkerWork = async (req, res, next) => {
    try {
        const { id } = req.params;
        const workerId = "60d5ec49f1b2c3d4e5f6a7b8"; // req.user.id;

        const work = await Portfolio.findOneAndDelete({ _id: id, worker: workerId });

        if (!work) {
            return next(new ApiError("Work not found", 404));
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
