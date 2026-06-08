import Category from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;

    const existCategory = await Category.findOne({ name });
    if (existCategory) {
      return next(new ApiError("هذاالتنصيف موجود بالفعل ", 400));
    }
    const category = await Category.create({ name, icon });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res
      .status(200)
      .json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError("التصنيف غير موجود", 404));
    }

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return next(new ApiError("التصنيف غير موجود", 404));
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!category) {
      return next(new ApiError("التصنيف غير موجود", 404));
    }

    res.status(200).json({ success: true, message: "تم اخفاء التصنيف بنجاح " });
  } catch (err) {
    next(err);
  }
};
