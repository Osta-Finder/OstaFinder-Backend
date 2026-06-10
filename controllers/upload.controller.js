import { supabase } from "../utils/supabaseClient.js";
import ApiError from "../utils/ApiError.js";
import Image from "../models/image.model.js";

// @desc    Upload image to Supabase bucket
// @route   POST /upload
// @access  Private
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError("من فضلك اختر ملف", 400));
    }

    const bucketName = req.body.bucket || "images";
    const file = req.file;
    const timestamp = Date.now();
    const ext = file.originalname.split(".").pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      return next(new ApiError(`فشل رفع الملف: ${error.message}`, 500));
    }

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const image = await Image.create({
      originalName: file.originalname,
      url: urlData.publicUrl,
      path: data.path,
      bucket: bucketName,
    });

    res.status(200).json({
      success: true,
      data: {
        _id: image._id,
        originalName: image.originalName,
        url: image.url,
        bucket: image.bucket,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all images from MongoDB (optionally filtered by bucket)
// @route   GET /upload
// @access  Private
export const getImages = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.bucket) filter.bucket = req.query.bucket;

    const images = await Image.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete image from Supabase bucket and MongoDB
// @route   DELETE /upload
// @access  Private
export const deleteImage = async (req, res, next) => {
  try {
    const { imageId } = req.body;
    if (!imageId) {
      return next(new ApiError("من فضلك أرسل معرف الصورة", 400));
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return next(new ApiError("الصورة غير موجودة", 404));
    }

    const { error } = await supabase.storage.from(image.bucket).remove([image.path]);

    if (error) {
      return next(new ApiError(`فشل حذف الملف: ${error.message}`, 500));
    }

    await Image.findByIdAndDelete(imageId);

    res.status(200).json({
      success: true,
      message: "تم حذف الملف بنجاح",
    });
  } catch (err) {
    next(err);
  }
};
