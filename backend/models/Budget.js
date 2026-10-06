const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category for this budget']
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a budget limit amount'],
      min: [1, 'Budget must be at least 1']
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    alertThreshold: {
      type: Number,
      default: 80, // alert when spending reaches 80%
      min: 10,
      max: 100
    }
  },
  { timestamps: true }
);

// Ensure a user only has one budget per category per month/year
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
