import Service from "../models/service.model.js";
import workerModel from "../models/worker.model.js";
import ApiError from "../utils/ApiError.js";

const getWorkerId = (req) => req.user?.id || req.user?._id;

// ============================================
// SERVICES
// ============================================
export const getWorkerServices = async (req, res, next) => {
  try {
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const services = await Service.find({ worker: workerId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const getWorkerServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

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
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const { title, category, price, description, location, image } = req.body;

    let finalCategory = category;
    if (!finalCategory) {
      const worker = await workerModel.findById(workerId).populate("category");
      finalCategory = worker?.category?.name;
    }

    if (!finalCategory) {
      finalCategory = "عام";
    }

    const service = await Service.create({
      worker: workerId,
      title,
      category: finalCategory,
      price,
      description,
      location,
      image,
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const updateWorkerService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, worker: workerId },
      req.body,
      { new: true },
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
    const workerId = getWorkerId(req);

    if (!workerId) {
      return next(new ApiError("Unauthorized", 401));
    }

    const service = await Service.findOneAndDelete({
      _id: id,
      worker: workerId,
    });

    if (!service) {
      return next(new ApiError("Service not found", 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
