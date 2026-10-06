const Recurring = require('../models/Recurring');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Helper to compute next due date based on frequency
const calculateNextDate = (currentDate, frequency) => {
  const d = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
};

// @desc    Get all recurring items
// @route   GET /api/recurring
// @access  Private
exports.getRecurring = async (req, res, next) => {
  try {
    const recurring = await Recurring.find({ user: req.user._id })
      .populate('category', 'name type icon color')
      .sort({ nextDueDate: 1 });

    res.status(200).json({
      success: true,
      count: recurring.length,
      data: recurring
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recurring transaction rule
// @route   POST /api/recurring
// @access  Private
exports.createRecurring = async (req, res, next) => {
  try {
    const { title, type, amount, category, frequency, startDate, nextDueDate, paymentMethod, autoProcess, notes } = req.body;

    if (!title || !type || !amount || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, type, amount and category' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const nextDue = nextDueDate ? new Date(nextDueDate) : start;

    const recurring = await Recurring.create({
      user: req.user._id,
      title,
      type,
      amount: Number(amount),
      category,
      frequency: frequency || 'monthly',
      startDate: start,
      nextDueDate: nextDue,
      paymentMethod: paymentMethod || 'credit_card',
      autoProcess: autoProcess !== undefined ? autoProcess : true,
      notes: notes || '',
      status: 'active'
    });

    const populated = await Recurring.findById(recurring._id).populate('category', 'name type icon color');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recurring transaction rule
// @route   PUT /api/recurring/:id
// @access  Private
exports.updateRecurring = async (req, res, next) => {
  try {
    const recurring = await Recurring.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!recurring) {
      return res.status(404).json({ success: false, message: 'Recurring transaction rule not found' });
    }

    const updated = await Recurring.findByIdAndUpdate(
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

// @desc    Toggle status (active / paused)
// @route   PATCH /api/recurring/:id/toggle
// @access  Private
exports.toggleRecurringStatus = async (req, res, next) => {
  try {
    const recurring = await Recurring.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!recurring) {
      return res.status(404).json({ success: false, message: 'Recurring transaction rule not found' });
    }

    recurring.status = recurring.status === 'active' ? 'paused' : 'active';
    await recurring.save();

    res.status(200).json({
      success: true,
      data: recurring,
      message: `Recurring schedule is now ${recurring.status}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually process / record a recurring transaction now
// @route   POST /api/recurring/:id/process
// @access  Private
exports.processRecurring = async (req, res, next) => {
  try {
    const recurring = await Recurring.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category');

    if (!recurring) {
      return res.status(404).json({ success: false, message: 'Recurring item not found' });
    }

    // 1. Create the transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      title: `${recurring.title} (Recurring)`,
      type: recurring.type,
      amount: recurring.amount,
      category: recurring.category._id,
      date: new Date(),
      paymentMethod: recurring.paymentMethod,
      isRecurring: true,
      recurringId: recurring._id,
      notes: recurring.notes || 'Generated from recurring schedule'
    });

    // 2. Update next due date and last processed date
    recurring.lastProcessedDate = new Date();
    recurring.nextDueDate = calculateNextDate(recurring.nextDueDate, recurring.frequency);
    await recurring.save();

    // 3. Create notification
    await Notification.create({
      user: req.user._id,
      title: `Recurring ${recurring.type === 'income' ? 'Income' : 'Expense'} Processed`,
      message: `"${recurring.title}" of ${recurring.amount} has been recorded into your transactions.`,
      type: 'recurring_due',
      link: '/transactions'
    });

    res.status(200).json({
      success: true,
      transaction,
      recurring,
      message: 'Transaction successfully generated from recurring schedule'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recurring rule
// @route   DELETE /api/recurring/:id
// @access  Private
exports.deleteRecurring = async (req, res, next) => {
  try {
    const recurring = await Recurring.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!recurring) {
      return res.status(404).json({ success: false, message: 'Recurring item not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Recurring rule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
