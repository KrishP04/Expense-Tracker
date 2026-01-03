const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  budget: {
    type: Number,
    default: 0,
    min: [0, 'Budget cannot be negative']
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);

