const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all categories (defaults + user custom)
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = {
      $or: [{ isDefault: true }, { user: req.user._id }]
    };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ isDefault: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Please provide category name and type' });
    }

    // Check if category name already exists for this user or default
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type,
      $or: [{ isDefault: true }, { user: req.user._id }]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }

    const category = await Category.create({
      name,
      type,
      icon: icon || 'tag',
      color: color || '#6366f1',
      user: req.user._id,
      isDefault: false
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or cannot edit default category' });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || category.name,
        icon: req.body.icon || category.icon,
        color: req.body.color || category.color
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or default categories cannot be deleted' });
    }

    // Check if transactions are using this category
    const transactionCount = await Transaction.countDocuments({ category: category._id });
    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${transactionCount} transactions are using this category. Reassign them first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
