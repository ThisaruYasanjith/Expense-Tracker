const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Please specify category type']
    },
    icon: {
      type: String,
      default: 'tag'
    },
    color: {
      type: String,
      default: '#6366f1'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates global/system default category
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
