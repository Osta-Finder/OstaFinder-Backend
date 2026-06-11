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

    if (req.files && (req.files.nationalId || req.files.certificates)) {
      console.log("Processing files...", req.files);
      const { supabase } = await import("../utils/supabaseClient.js");
      
      // Get files from the correct structure (upload.fields returns object with field names as keys)
      const nationalIdFiles = req.files.nationalId || [];
      const certificateFiles = req.files.certificates || [];
      
      // Only initialize certificates array if there are new certificate files
      if (certificateFiles.length > 0) {
        updateData.certificates = [];
      }
      
      console.log(`National ID files: ${nationalIdFiles.length}, Certificate files: ${certificateFiles.length}`);
      
      // Upload national ID
      for (let file of nationalIdFiles) {
        console.log(`Processing national ID: ${file.originalname}`);
        const timestamp = Date.now();
        const ext = file.originalname.split(".").pop();
        const fileName = `nationalId-${workerId}-${timestamp}.${ext}`;
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("images")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (uploadError) {
            console.error(`Upload error for national ID:`, uploadError);
            throw new Error(`Failed to upload national ID: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          
          updateData.nationalId = publicUrl;
          console.log(`National ID saved: ${publicUrl}`);
        } catch (err) {
          console.error(`Error uploading national ID:`, err.message);
          throw err;
        }
      }
      
      // Upload certificates (handle multiple files correctly)
      for (let i = 0; i < certificateFiles.length; i++) {
        const file = certificateFiles[i];
        console.log(`Processing certificate ${i + 1}/${certificateFiles.length}: ${file.originalname}`);
        console.log(`Certificate file size: ${file.size} bytes`);
        const timestamp = Date.now();
        const ext = file.originalname.split(".").pop();
        const fileName = `certificate-${workerId}-${timestamp}-${i}.${ext}`;
        
        try {
          console.log(`Uploading certificate ${i + 1} with filename: ${fileName}`);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("images")
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (uploadError) {
            console.error(`Upload error for certificate ${i + 1}:`, uploadError);
            throw new Error(`Failed to upload certificate ${i + 1}: ${uploadError.message}`);
          }

          console.log(`Certificate ${i + 1} uploaded successfully to Supabase`);
          const { data: { publicUrl } } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);
          
          console.log(`Getting public URL for certificate ${i + 1}: ${publicUrl}`);
          updateData.certificates.push(publicUrl);
          console.log(`Certificate ${i + 1} added to array. Total certificates so far: ${updateData.certificates.length}`);
        } catch (err) {
          console.error(`Error uploading certificate ${i + 1}:`, err.message);
          throw err;
        }
      }
      
      console.log("All files processed. Final Certificates array:", updateData.certificates, "Length:", updateData.certificates.length);
    }

    console.log("Update data:", updateData);
    console.log("Certificates before update:", updateData.certificates);

    const updatedWorker = await workerModel.findByIdAndUpdate(
      workerId,
      updateData,
      { returnDocument: 'after', runValidators: false }
    ).populate('category', 'name');
    
    console.log("Certificates after update:", updatedWorker?.certificates);

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
