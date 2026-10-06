const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a savings goal title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please provide a target amount'],
      min: [1, 'Target amount must be greater than 0']
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative']
    },
    targetDate: {
      type: Date,
      required: [true, 'Please provide a target date']
    },
    category: {
      type: String,
      default: 'Emergency Fund'
    },
    color: {
      type: String,
      default: '#10b981'
    },
    notes: {
      type: String,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', GoalSchema);
