const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Expense = require('../models/Expense');

// Validation middleware
const validateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 1, max: 50 }).withMessage('Category name must be between 1 and 50 characters'),
  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a non-negative number'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color')
];

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET category by name
router.get('/:name', async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name.toLowerCase() });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new category
router.post('/', validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryData = {
      ...req.body,
      name: req.body.name.toLowerCase()
    };

    const category = new Category(categoryData);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// PUT update category
router.put('/:name', validateCategory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findOneAndUpdate(
      { name: req.params.name.toLowerCase() },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE category
router.delete('/:name', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ name: req.params.name.toLowerCase() });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET category budget status
router.get('/:name/budget-status', async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.name.toLowerCase() });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { startDate, endDate } = req.query;
    const matchQuery = { category: category.name };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const spent = await Expense.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalSpent = spent[0]?.total || 0;
    const remaining = category.budget - totalSpent;
    const percentage = category.budget > 0 ? (totalSpent / category.budget) * 100 : 0;

    res.json({
      category: category.name,
      budget: category.budget,
      spent: totalSpent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
      overBudget: remaining < 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

