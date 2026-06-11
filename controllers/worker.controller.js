import asyncHandler from "express-async-handler";

import categoryModel from "../models/category.model.js";
import workerModel from "../models/worker.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";

// @desc    Get list of workers with filtering, pagination, sorting, and search
// @route   GET /workers
// @access  Public
export const getWorkers = asyncHandler(async (req, res, next) => {
    let filter = {};
    // Search
    if (req.query.keyword) {
      const matchingCategories = await categoryModel
        .find({
          name: { $regex: req.query.keyword, $options: "i" },
        })
        .select("_id");

      const categoryIds = matchingCategories.map((cat) => cat._id);

      filter.$or = [
        {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          category: {
            $in: categoryIds,
          },
        },
      ];
    }
    // Build query
    const apiFeatures = new ApiFeatures(workerModel.find(filter), req.query)
      .filter()
      .sort();
    // Get correct count after all filters
    const countDocuments = await workerModel.countDocuments(
      apiFeatures.mongooseQuery.getFilter(),
    );
    // Pagination
    apiFeatures.paginate(countDocuments);
    // Execute query
    const workers = await apiFeatures.mongooseQuery.populate(
      "category",
      "name",
    );

    res.status(200).json({
      success: true,
      results: workers.length,
      pagination: apiFeatures.paginationResult,
      data: workers,
    });
});

// @desc    Get top rated worker in each category
// @route   GET /workers/top-by-category
// @access  Public
export const getTopWorkersByCategory = asyncHandler(async (req, res, next) => {
    const topWorkers = await workerModel.aggregate([
      { $sort: { rating: -1 } },
      {
        $group: {
          _id: "$category",
          worker: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$worker" },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $sort: { rating: -1 },
      },
      { $limit: 6 },
    ]);

    res.status(200).json({
      success: true,
      results: topWorkers.length,
      data: topWorkers,
    });
});


export const submitOnboarding = asyncHandler(async (req, res, next) => {
  try {
    console.log("Onboarding submission received");
    
    const { firstName, lastName, email, phone, city, address, specialization, yearsOfExperience, bio, nationalId, certificates } = req.body;
    
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const workerId = req.user._id;

    const updateData = {
      name: `${firstName} ${lastName}`,
      email: email,
      phoneNumber: phone,
    };

    if (specialization) {
      let categoryId = null;
      
      const isValidObjectId = specialization.match(/^[0-9a-fA-F]{24}$/);
      
      if (isValidObjectId) {
        categoryId = specialization;
      } else {
        const category = await categoryModel.findOne({ name: specialization });
        if (category) {
          categoryId = category._id;
        } else {
          return res.status(400).json({
            success: false,
            message: `Category "${specialization}" not found`
          });
        }
      }
      
      updateData.category = categoryId;
    }
    
    if (yearsOfExperience) {
      updateData.yearsOfExperience = yearsOfExperience;
    }
    if (bio) {
      updateData.bio = bio;
    }
    if (address) {
      updateData.address = address;
    }
    if (city) {
      updateData.city = city;
    }

    // Handle uploaded file URLs from frontend
    if (nationalId) {
      updateData.nationalId = nationalId;
      console.log(`National ID URL saved: ${nationalId}`);
    }

    if (certificates) {
      // certificates can be a single string or an array of strings
      if (Array.isArray(certificates)) {
        updateData.certificates = certificates;
      } else if (certificates) {
        updateData.certificates = [certificates];
      }
      console.log(`Certificates URLs saved:`, updateData.certificates);
    }

    // Mark worker as onboarded
    updateData.isOnboarded = true;
    // Set approval status to pending
    updateData.approvalStatus = 'pending';

    console.log("Update data:", updateData);

    const updatedWorker = await workerModel.findByIdAndUpdate(
      workerId,
      updateData,
      { returnDocument: 'after', runValidators: false }
    ).populate('category', 'name');

    if (!updatedWorker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      data: updatedWorker
    });
  } catch (error) {
    console.error("Onboarding error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting onboarding"
    });
  }
});


export const getWorkerProfile = asyncHandler(async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const worker = await workerModel.findById(req.user._id).populate('category', 'name');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    console.error("Get worker profile error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching worker profile"
    });
  }
});


// @desc    Get pending workers for admin approval
// @route   GET /workers/pending-approval
// @access  Admin
export const getPendingWorkers = asyncHandler(async (req, res, next) => {
  try {
    const pendingWorkers = await workerModel
      .find({ approvalStatus: 'pending' })
      .populate('category', 'name')
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: pendingWorkers.length,
      data: pendingWorkers
    });
  } catch (error) {
    console.error("Get pending workers error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching pending workers"
    });
  }
});

// @desc    Approve or reject worker
// @route   PATCH /workers/:workerId/approval
// @access  Admin
export const updateWorkerApproval = asyncHandler(async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'"
      });
    }

    const updateData = {
      approvalStatus: status
    };

    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    const updatedWorker = await workerModel.findByIdAndUpdate(
      workerId,
      updateData,
      { returnDocument: 'after', runValidators: false }
    ).populate('category', 'name')
      .select('-password -refreshToken');

    if (!updatedWorker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Worker ${status} successfully`,
      data: updatedWorker
    });
  } catch (error) {
    console.error("Update worker approval error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating worker approval"
    });
  }
});
