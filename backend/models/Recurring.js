const mongoose = require('mongoose');

const RecurringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide title for recurring transaction'],
      trim: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    nextDueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active'
    },
    paymentMethod: {
      type: String,
      default: 'credit_card'
    },
    lastProcessedDate: {
      type: Date,
      default: null
    },
    autoProcess: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recurring', RecurringSchema);
