const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Please specify transaction type']
    },
    amount: {
      type: Number,
      required: [true, 'Please enter a valid amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category']
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'crypto', 'other'],
      default: 'credit_card'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recurring',
      default: null
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
