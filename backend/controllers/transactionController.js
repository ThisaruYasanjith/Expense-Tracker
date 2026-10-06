const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper to check budget alerts after an expense is added
const checkBudgetAlerts = async (userId, categoryId, transactionDate) => {
  try {
    const txDate = new Date(transactionDate);
    const month = txDate.getMonth() + 1;
    const year = txDate.getFullYear();

    const budget = await Budget.findOne({ user: userId, category: categoryId, month, year }).populate('category');
    if (!budget) return;

    // Calculate total spent for this category in this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          type: 'expense',
          category: new mongoose.Types.ObjectId(categoryId),
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

    const totalSpent = result.length > 0 ? result[0].total : 0;
    const percentage = Math.round((totalSpent / budget.amount) * 100);
    const catName = budget.category ? budget.category.name : 'Category';

    if (percentage >= 100) {
      await Notification.create({
        user: userId,
        title: `Budget Exceeded: ${catName}`,
        message: `You have spent ${totalSpent.toFixed(2)} (${percentage}%) of your ${budget.amount} budget for ${catName}.`,
        type: 'budget_exceeded',
        link: '/budgets'
      });
    } else if (percentage >= (budget.alertThreshold || 80)) {
      await Notification.create({
        user: userId,
        title: `Budget Warning: ${catName}`,
        message: `You have reached ${percentage}% of your budget for ${catName} (${totalSpent.toFixed(2)} / ${budget.amount}).`,
        type: 'budget_warning',
        link: '/budgets'
      });
    }
  } catch (err) {
    console.error('Error checking budget alerts:', err.message);
  }
};

// @desc    Get all transactions with filtering & pagination
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('category', 'name type icon color')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category', 'name type icon color');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { title, type, amount, category, date, paymentMethod, notes, tags } = req.body;

    if (!title || !type || !amount || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, type, amount and category' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      type,
      amount: Number(amount),
      category,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'credit_card',
      notes: notes || '',
      tags: tags || []
    });

    const populated = await Transaction.findById(transaction._id).populate('category', 'name type icon color');

    // If expense, check budget alert asynchronously
    if (type === 'expense') {
      checkBudgetAlerts(req.user._id, category, transaction.date);
    }

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name type icon color');

    if (updated.type === 'expense') {
      checkBudgetAlerts(req.user._id, updated.category._id || updated.category, updated.date);
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary (financial totals, charts, budget health, savings)
// @route   GET /api/transactions/dashboard
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    // 1. All-time Totals
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    totals.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpense = item.total;
    });
    const balance = totalIncome - totalExpense;

    // 2. Current Month Totals
    const currentMonthTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let monthIncome = 0;
    let monthExpense = 0;
    currentMonthTotals.forEach((item) => {
      if (item._id === 'income') monthIncome = item.total;
      if (item._id === 'expense') monthExpense = item.total;
    });

    // 3. Category Breakdown (Current Month Expenses)
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          categoryId: '$_id',
          name: '$categoryDetails.name',
          color: '$categoryDetails.color',
          icon: '$categoryDetails.icon',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // 4. Monthly Flow for last 6 months
    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const key = `${mNum}-${yNum}`;
      trendMap[key] = {
        name: `${monthNames[mNum - 1]} ${yNum}`,
        month: mNum,
        year: yNum,
        income: 0,
        expense: 0
      };
    }

    monthlyTrends.forEach((item) => {
      const key = `${item._id.month}-${item._id.year}`;
      if (trendMap[key]) {
        if (item._id.type === 'income') trendMap[key].income = item.total;
        if (item._id.type === 'expense') trendMap[key].expense = item.total;
      }
    });

    const monthlyTrendsArray = Object.values(trendMap);

    // 5. Recent 5 Transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .populate('category', 'name type icon color')
      .sort({ date: -1 })
      .limit(6);

    // 6. Savings Goals Progress
    const goals = await Goal.find({ user: userId }).limit(4);

    // 7. Active Budgets
    const budgets = await Budget.find({ user: userId, month: currentMonth, year: currentYear })
      .populate('category', 'name icon color');

    // Calculate budget spent amounts
    const budgetStatus = await Promise.all(
      budgets.map(async (b) => {
        const catSpentResult = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: 'expense',
              category: b.category._id,
              date: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const spent = catSpentResult.length > 0 ? catSpentResult[0].total : 0;
        const percentage = Math.round((spent / b.amount) * 100);

        return {
          _id: b._id,
          category: b.category,
          budgetAmount: b.amount,
          spentAmount: spent,
          remainingAmount: Math.max(0, b.amount - spent),
          percentage,
          isExceeded: spent > b.amount,
          isNearLimit: percentage >= (b.alertThreshold || 80)
        };
      })
    );

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        monthIncome,
        monthExpense,
        monthSavings: monthIncome - monthExpense,
        savingsRate: monthIncome > 0 ? Math.max(0, Math.round(((monthIncome - monthExpense) / monthIncome) * 100)) : 0
      },
      categoryBreakdown,
      monthlyTrends: monthlyTrendsArray,
      recentTransactions,
      goals,
      budgets: budgetStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get in-depth analytics
// @route   GET /api/transactions/analytics
// @access  Private
exports.getFinancialAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { timeRange = 'year' } = req.query; // 'month', '6months', 'year', 'all'

    const now = new Date();
    let startDate;

    if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === '6months') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    } else {
      startDate = new Date(2000, 0, 1);
    }

    // Category-wise aggregate for expenses
    const expenseByCategory = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          color: '$category.color',
          icon: '$category.icon',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Payment method distribution
    const paymentMethods = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly flow
    const monthlyFlow = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      expenseByCategory,
      paymentMethods,
      monthlyFlow
    });
  } catch (error) {
    next(error);
  }
};
