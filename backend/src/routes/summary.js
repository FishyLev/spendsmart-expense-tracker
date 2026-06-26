const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');

router.use(protect);

// GET /summary/monthly — Current month summary
router.get('/monthly', async (req, res) => {
  try {
    const now = new Date();
    const { year = now.getFullYear(), month = now.getMonth() + 1 } = req.query;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      user_id: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryBreakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Round all values
    Object.keys(categoryBreakdown).forEach(k => {
      categoryBreakdown[k] = parseFloat(categoryBreakdown[k].toFixed(2));
    });

    res.json({
      month: `${year}-${String(month).padStart(2, '0')}`,
      total: parseFloat(total.toFixed(2)),
      count: expenses.length,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
