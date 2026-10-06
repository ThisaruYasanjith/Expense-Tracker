const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Get all budgets for a given month and year
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year
    }).populate('category', 'name type icon color');

    // Compute spent for each budget in this month
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (b) => {
        const spentResult = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(req.user._id),
              type: 'expense',
              category: b.category ? b.category._id : null,
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const spentAmount = spentResult.length > 0 ? spentResult[0].total : 0;
        const remainingAmount = b.amount - spentAmount;
        const percentage = Math.round((spentAmount / b.amount) * 100);

        let status = 'good';
        if (percentage >= 100) {
          status = 'exceeded';
        } else if (percentage >= (b.alertThreshold || 80)) {
          status = 'warning';
        }

        return {
          _id: b._id,
          category: b.category,
          amount: b.amount,
          month: b.month,
          year: b.year,
          alertThreshold: b.alertThreshold,
          spentAmount,
          remainingAmount,
          percentage,
          status,
          createdAt: b.createdAt
        };
      })
    );

    // Calculate total budgeted vs total spent
    const totalBudget = budgetsWithSpent.reduce((acc, curr) => acc + curr.amount, 0);
    const totalSpent = budgetsWithSpent.reduce((acc, curr) => acc + curr.spentAmount, 0);

    res.status(200).json({
      success: true,
      month,
      year,
      totalBudget,
      totalSpent,
      totalRemaining: Math.max(0, totalBudget - totalSpent),
      data: budgetsWithSpent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year, alertThreshold } = req.body;
    const now = new Date();

    const budgetMonth = parseInt(month, 10) || (now.getMonth() + 1);
    const budgetYear = parseInt(year, 10) || now.getFullYear();

    if (!category || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide category and budget amount' });
    }

    const existing = await Budget.findOne({
      user: req.user._id,
      category,
      month: budgetMonth,
      year: budgetYear
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A budget already exists for this category in the selected month/year. Please edit the existing one.'
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount: Number(amount),
      month: budgetMonth,
      year: budgetYear,
      alertThreshold: alertThreshold ? Number(alertThreshold) : 80
    });

    const populated = await Budget.findById(budget._id).populate('category', 'name type icon color');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name type icon color');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
