const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Recurring = require('../models/Recurring');

// @desc    Get admin platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTransactions, totalBudgets, totalGoals, totalRecurring] = await Promise.all([
      User.countDocuments(),
      Transaction.countDocuments(),
      Budget.countDocuments(),
      Goal.countDocuments(),
      Recurring.countDocuments()
    ]);

    const volumeAgg = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let totalIncomeVolume = 0;
    let totalExpenseVolume = 0;
    volumeAgg.forEach((item) => {
      if (item._id === 'income') totalIncomeVolume = item.total;
      if (item._id === 'expense') totalExpenseVolume = item.total;
    });

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalBudgets,
        totalGoals,
        totalRecurring,
        totalIncomeVolume,
        totalExpenseVolume,
        totalVolume: totalIncomeVolume + totalExpenseVolume
      },
      recentUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with search and pagination)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    // Attach transaction count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const txCount = await Transaction.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          transactionCount: txCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user blocked status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot block your own admin account' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User is now ${user.isBlocked ? 'Blocked' : 'Active'}`,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (user/admin)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote your own admin account' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and cascade delete their data
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    // Cascade delete
    await Promise.all([
      Transaction.deleteMany({ user: user._id }),
      Budget.deleteMany({ user: user._id }),
      Goal.deleteMany({ user: user._id }),
      Recurring.deleteMany({ user: user._id }),
      User.findByIdAndDelete(user._id)
    ]);

    res.status(200).json({
      success: true,
      message: 'User and all associated financial records permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};
