import React, { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '../services/api';
import './CategoryManager.css';

function CategoryManager({ categories, onCategoryChange }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    color: '#3B82F6'
  });
  const [editingCategory, setEditingCategory] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.name, {
          ...formData,
          budget: parseFloat(formData.budget) || 0
        });
      } else {
        await createCategory({
          ...formData,
          budget: parseFloat(formData.budget) || 0
        });
      }
      setFormData({ name: '', budget: '', color: '#3B82F6' });
      setShowForm(false);
      setEditingCategory(null);
      if (onCategoryChange) onCategoryChange();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      budget: category.budget || '',
      color: category.color || '#3B82F6'
    });
    setShowForm(true);
  };

  const handleDelete = async (name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteCategory(name);
        if (onCategoryChange) onCategoryChange();
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="category-manager-container">
      <div className="category-manager-header">
        <h2>Manage Categories</h2>
        <button onClick={() => {
          setShowForm(!showForm);
          setEditingCategory(null);
          setFormData({ name: '', budget: '', color: '#3B82F6' });
        }} className="add-category-btn">
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={!!editingCategory}
            />
          </div>
          <div className="form-group">
            <label>Budget ($)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          <button type="submit" className="submit-btn">
            {editingCategory ? 'Update' : 'Create'} Category
          </button>
        </form>
      )}

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category._id || category.name} className="category-card">
            <div
              className="category-color"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            ></div>
            <div className="category-info">
              <h3>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</h3>
              <p>Budget: ${parseFloat(category.budget || 0).toFixed(2)}</p>
            </div>
            <div className="category-actions">
              <button onClick={() => handleEdit(category)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => handleDelete(category.name)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryManager;

