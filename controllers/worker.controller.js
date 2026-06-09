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
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    const { firstName, lastName, email, phone, city, address, specialization, yearsOfExperience, bio } = req.body;
    
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

    if (req.files && req.files.length > 0) {
      console.log("Processing files...", req.files.length);
      const { supabase } = await import("../utils/supabaseClient.js");
      
      // Initialize certificates array
      updateData.certificates = [];
      
      for (let file of req.files) {
        console.log(`Processing file: ${file.fieldname} - ${file.originalname}`);
        const timestamp = Date.now();
        const ext = file.originalname.split(".").pop();
        const fileName = `${file.fieldname}-${workerId}-${timestamp}.${ext}`;
        
        try {
          // Upload file to Supabase
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("images")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (uploadError) {
            console.error(`Upload error for ${file.fieldname}:`, uploadError);
            throw new Error(`Failed to upload ${file.fieldname}: ${uploadError.message}`);
          }

          console.log(`File uploaded successfully: ${fileName}`);

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          
          console.log(`Public URL: ${publicUrl}`);
          
          if (file.fieldname === "nationalId") {
            updateData.nationalId = publicUrl;
            console.log(`National ID saved: ${publicUrl}`);
          } else if (file.fieldname === "certificates") {
            updateData.certificates.push(publicUrl);
            console.log(`Certificate saved: ${publicUrl}`);
          }
        } catch (err) {
          console.error(`Error uploading ${file.fieldname}:`, err.message);
          throw err;
        }
      }
      
      console.log("All files processed. Certificates array:", updateData.certificates);
    } else {
      console.log("No files received");
      updateData.certificates = [];
    }

    console.log("Update data:", updateData);

    const updatedWorker = await workerModel.findByIdAndUpdate(
      workerId,
      { $set: updateData },
      { new: true, runValidators: false }
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
