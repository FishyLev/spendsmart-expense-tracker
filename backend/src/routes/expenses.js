const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Expense = require('../models/Expense');

const CATEGORIES = ['food', 'travel', 'shopping', 'bills', 'other'];

router.use(protect); // All expense routes require auth

// POST /expenses — Add expense
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be > 0'),
  body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const expense = await Expense.create({ ...req.body, user_id: req.user._id });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /expenses — List with optional filters
router.get('/', async (req, res) => {
  try {
    const filter = { user_id: req.user._id };
    const { category, from, to } = req.query;

    if (category && CATEGORIES.includes(category)) filter.category = category;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ count: expenses.length, expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /expenses/:id — Update expense
router.put('/:id', [
  body('title').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().isIn(CATEGORIES),
  body('date').optional().isISO8601(),
  body('notes').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const expense = await Expense.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });

    Object.assign(expense, req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /expenses/:id — Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
