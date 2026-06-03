// controllers/category.controller.js
import Category from '../models/Category.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin (Or public for testing now)
export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'هذا التصنيف موجود بالفعل' });
    }

    const category = await Category.create({ name, icon, description });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    // Only fetch active categories for the client UI
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'التصنيف غير موجود' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'التصنيف غير موجود' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    // Soft delete is better practice: set isActive to false
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'التصنيف غير موجود' });
    }

    res.status(200).json({ success: true, message: 'تم إخفاء/حذف التصنيف بنجاح' });
  } catch (error) {
    next(error);
  }
};