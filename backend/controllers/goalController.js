const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

// @desc    Get all savings goals
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    const goalsWithStats = goals.map((g) => {
      const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

      const target = new Date(g.targetDate);
      const today = new Date();
      const diffTime = target.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...g.toObject(),
        percentage,
        remainingAmount,
        daysRemaining: Math.max(0, daysRemaining),
        isOverdue: daysRemaining < 0 && !g.isCompleted
      };
    });

    const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
    const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);

    res.status(200).json({
      success: true,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
      data: goalsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new savings goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, category, color, notes } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, target amount and target date' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate: new Date(targetDate),
      category: category || 'General Savings',
      color: color || '#10b981',
      notes: notes || '',
      isCompleted: currentAmount && Number(currentAmount) >= Number(targetAmount)
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a savings goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    const { title, targetAmount, currentAmount, targetDate, category, color, notes, isCompleted } = req.body;

    const fieldsToUpdate = {};
    if (title) fieldsToUpdate.title = title;
    if (targetAmount) fieldsToUpdate.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) fieldsToUpdate.currentAmount = Number(currentAmount);
    if (targetDate) fieldsToUpdate.targetDate = new Date(targetDate);
    if (category) fieldsToUpdate.category = category;
    if (color) fieldsToUpdate.color = color;
    if (notes !== undefined) fieldsToUpdate.notes = notes;
    if (isCompleted !== undefined) fieldsToUpdate.isCompleted = isCompleted;

    const updated = await Goal.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Contribute or withdraw from a goal
// @route   POST /api/goals/:id/contribute
// @access  Private
exports.contributeToGoal = async (req, res, next) => {
  try {
    const { amount, action = 'deposit' } = req.body; // action: 'deposit' or 'withdraw'

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid contribution amount' });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    const numAmount = Number(amount);
    if (action === 'deposit') {
      goal.currentAmount += numAmount;
    } else if (action === 'withdraw') {
      goal.currentAmount = Math.max(0, goal.currentAmount - numAmount);
    }

    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      // Trigger milestone notification
      await Notification.create({
        user: req.user._id,
        title: `🎯 Goal Reached: ${goal.title}!`,
        message: `Congratulations! You've achieved your savings goal of ${goal.targetAmount} for "${goal.title}".`,
        type: 'goal_milestone',
        link: '/goals'
      });
    } else if (goal.currentAmount < goal.targetAmount && goal.isCompleted) {
      goal.isCompleted = false;
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: goal,
      message: action === 'deposit' ? `Successfully deposited ${numAmount}` : `Successfully withdrew ${numAmount}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Savings goal removed successfully'
    });
  } catch (error) {
    next(error);
  }
};
