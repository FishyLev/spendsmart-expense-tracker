const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

router.use(protect);

// POST /budget — Create or update budget for a month
router.post('/', [
  body('month').matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month must be in YYYY-MM format'),
  body('amount').isFloat({ min: 0 }).withMessage('Budget amount must be >= 0'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { month, amount } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user_id: req.user._id, month },
      { amount },
      { upsert: true, new: true, runValidators: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /budget/current — Current month's budget + spent + remaining
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [budget, expenses] = await Promise.all([
      Budget.findOne({ user_id: req.user._id, month }),
      Expense.find({ user_id: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    ]);

    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetAmount = budget?.amount ?? 0;
    const remaining = budgetAmount - spent;

    res.json({
      month,
      budget: budgetAmount,
      spent: parseFloat(spent.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      exceeded: remaining < 0,
      warning: remaining < 0 ? `⚠️ You've exceeded your budget by ₹${Math.abs(remaining).toFixed(2)}` : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
