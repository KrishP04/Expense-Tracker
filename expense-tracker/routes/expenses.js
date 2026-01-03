const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Validation middleware
const validateExpense = [
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

// GET all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category, limit = 100, page = 1 } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new expense
router.post('/', validateExpense, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update expense
router.put('/:id', validateExpense, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET expenses summary/statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalAmount = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      byCategory: stats,
      total: totalAmount[0]?.total || 0,
      count: await Expense.countDocuments(matchQuery)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET CSV export
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    const csvWriter = createCsvWriter({
      path: 'temp_expenses.csv',
      header: [
        { id: 'description', title: 'Description' },
        { id: 'amount', title: 'Amount' },
        { id: 'category', title: 'Category' },
        { id: 'date', title: 'Date' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    const records = expenses.map(expense => ({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString().split('T')[0],
      notes: expense.notes || ''
    }));

    await csvWriter.writeRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    
    const fs = require('fs');
    const csvContent = fs.readFileSync('temp_expenses.csv');
    fs.unlinkSync('temp_expenses.csv');
    
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

