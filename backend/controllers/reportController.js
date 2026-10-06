const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Export transactions as CSV
// @route   GET /api/reports/export-csv
// @access  Private
exports.exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
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

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .sort({ date: -1 });

    // Build CSV string
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes', 'Recurring'];
    const rows = transactions.map((t) => [
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type.toUpperCase(),
      `"${(t.category ? t.category.name : 'Uncategorized').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.paymentMethod || 'other',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.isRecurring ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_report_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed report statement data
// @route   GET /api/reports/statement
// @access  Private
exports.getStatementData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const matchStage = {
      user: userId,
      date: { $gte: start, $lte: end }
    };

    const [transactions, totals] = await Promise.all([
      Transaction.find(matchStage).populate('category', 'name type icon color').sort({ date: -1 }),
      Transaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    totals.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
        incomeCount = item.count;
      }
      if (item._id === 'expense') {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    res.status(200).json({
      success: true,
      period: {
        startDate: start,
        endDate: end
      },
      summary: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
        incomeCount,
        expenseCount,
        totalTransactions: transactions.length
      },
      transactions
    });
  } catch (error) {
    next(error);
  }
};
