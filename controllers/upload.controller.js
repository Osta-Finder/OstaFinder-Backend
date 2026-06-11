import { supabase } from "../utils/supabaseClient.js";
import ApiError from "../utils/ApiError.js";

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

    res.status(200).json({
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all images from Supabase bucket
// @route   GET /upload
// @access  Private
export const getImages = async (req, res, next) => {
  try {
    const bucketName = req.query.bucket || "images";

    const { data, error } = await supabase.storage.from(bucketName).list();

    if (error) {
      return next(new ApiError(`فشل جلب الصور: ${error.message}`, 500));
    }

    const images = data.map((file) => {
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file.name);

      return {
        path: file.name,
        url: urlData.publicUrl,
        created_at: file.created_at,
      };
    });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete image from Supabase bucket
// @route   DELETE /upload
// @access  Private
export const deleteImage = async (req, res, next) => {
  try {
    const { path } = req.body;
    if (!path) {
      return next(new ApiError("من فضلك أرسل مسار الملف", 400));
    }

    const bucketName = req.body.bucket || "images";

    const { error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      return next(new ApiError(`فشل حذف الملف: ${error.message}`, 500));
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الملف بنجاح",
    });
  } catch (err) {
    next(err);
  }
};
