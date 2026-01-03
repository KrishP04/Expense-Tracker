import React, { useState } from 'react';
import { format } from 'date-fns';
import { deleteExpense, updateExpense, exportToCSV } from '../services/api';
import './ExpenseList.css';

function ExpenseList({ expenses, categories, onUpdate, onDelete, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState({ category: '', startDate: '', endDate: '' });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        if (onDelete) onDelete();
      } catch (error) {
        alert('Failed to delete expense');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      notes: expense.notes || ''
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateExpense(id, {
        ...editForm,
        amount: parseFloat(editForm.amount)
      });
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Failed to update expense');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleExport = async () => {
    try {
      await exportToCSV(filter);
    } catch (error) {
      alert('Failed to export expenses');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter.category && expense.category !== filter.category) return false;
    if (filter.startDate && new Date(expense.date) < new Date(filter.startDate)) return false;
    if (filter.endDate && new Date(expense.date) > new Date(filter.endDate)) return false;
    return true;
  });

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h2>Expenses</h2>
        <button onClick={handleExport} className="export-button">
          Export CSV
        </button>
      </div>

      <div className="filters">
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id || cat.name} value={cat.name}>
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          placeholder="End Date"
        />
        <button onClick={() => setFilter({ category: '', startDate: '', endDate: '' })}>
          Clear
        </button>
      </div>

      <div className="expense-list">
        {filteredExpenses.length === 0 ? (
          <div className="no-expenses">No expenses found</div>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense._id} className="expense-item">
              {editingId === expense._id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    step="0.01"
                  />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveEdit(expense._id)} className="save-btn">
                      Save
                    </button>
                    <button onClick={handleCancelEdit} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="expense-info">
                    <h3>{expense.description}</h3>
                    <p className="expense-category">{expense.category}</p>
                    <p className="expense-date">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </p>
                    {expense.notes && <p className="expense-notes">{expense.notes}</p>}
                  </div>
                  <div className="expense-amount">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </div>
                  <div className="expense-actions">
                    <button onClick={() => handleEdit(expense)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(expense._id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExpenseList;

