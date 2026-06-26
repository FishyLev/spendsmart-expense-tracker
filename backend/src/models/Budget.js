const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget cannot be negative'],
  },
}, { timestamps: true });

// One budget per user per month
budgetSchema.index({ user_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
