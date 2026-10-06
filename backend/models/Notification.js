const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['budget_warning', 'budget_exceeded', 'recurring_due', 'goal_milestone', 'system', 'info'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
