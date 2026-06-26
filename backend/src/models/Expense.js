const mongoose = require('mongoose');

const CATEGORIES = ['food', 'travel', 'shopping', 'bills', 'other'];

const expenseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: { values: CATEGORIES, message: `Category must be one of: ${CATEGORIES.join(', ')}` },
  },
  date: {
    type: Date,
    default: () => new Date(),
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
}, { timestamps: true });

// Index for efficient querying by user + date + category
expenseSchema.index({ user_id: 1, date: -1 });
expenseSchema.index({ user_id: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
