import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBudgetStatus } from '../services/api';
import './Dashboard.css';

function Dashboard({ expenses, categories, stats }) {
  const [budgetStatuses, setBudgetStatuses] = useState([]);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadBudgetStatuses();
  }, [categories, timeRange]);

  const loadBudgetStatuses = async () => {
    const now = new Date();
    let startDate = '';
    
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (timeRange === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }

    const statuses = await Promise.all(
      categories.map(async (cat) => {
        try {
          const status = await getBudgetStatus(cat.name, { startDate });
          return status;
        } catch (error) {
          return {
            category: cat.name,
            budget: cat.budget || 0,
            spent: 0,
            remaining: cat.budget || 0,
            percentage: 0,
            overBudget: false
          };
        }
      })
    );
    setBudgetStatuses(statuses);
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalBudget = categories.reduce((sum, cat) => sum + (parseFloat(cat.budget) || 0), 0);

  const pieData = stats?.byCategory?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: parseFloat(item.total.toFixed(2))
  })) || [];

  const barData = stats?.byCategory?.map(item => ({
    category: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    spent: parseFloat(item.total.toFixed(2)),
    count: item.count
  })) || [];

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-value">${totalSpent.toFixed(2)}</p>
          <p className="stat-label">{expenses.length} transactions</p>
        </div>
        <div className="stat-card">
          <h3>Total Budget</h3>
          <p className="stat-value">${totalBudget.toFixed(2)}</p>
          <p className="stat-label">Across {categories.length} categories</p>
        </div>
        <div className="stat-card">
          <h3>Remaining</h3>
          <p className={`stat-value ${totalBudget - totalSpent < 0 ? 'negative' : ''}`}>
            ${(totalBudget - totalSpent).toFixed(2)}
          </p>
          <p className="stat-label">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% used` : 'No budget set'}
          </p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Expenses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No expense data available</div>
          )}
        </div>

        <div className="chart-card">
          <h3>Spending Overview</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="spent" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No expense data available</div>
          )}
        </div>
      </div>

      <div className="budget-status-section">
        <h3>Budget Status by Category</h3>
        <div className="budget-cards">
          {budgetStatuses.map((status, index) => {
            const category = categories.find(c => c.name === status.category);
            const color = category?.color || COLORS[index % COLORS.length];
            return (
              <div key={status.category} className="budget-card">
                <div className="budget-header">
                  <h4>{status.category.charAt(0).toUpperCase() + status.category.slice(1)}</h4>
                  <span className={`budget-badge ${status.overBudget ? 'over' : 'under'}`}>
                    {status.overBudget ? 'Over Budget' : 'Under Budget'}
                  </span>
                </div>
                <div className="budget-bar-container">
                  <div
                    className="budget-bar"
                    style={{
                      width: `${Math.min(status.percentage, 100)}%`,
                      backgroundColor: status.overBudget ? '#e74c3c' : color
                    }}
                  ></div>
                </div>
                <div className="budget-details">
                  <span>Spent: ${status.spent.toFixed(2)}</span>
                  <span>Budget: ${status.budget.toFixed(2)}</span>
                  <span>Remaining: ${status.remaining.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

