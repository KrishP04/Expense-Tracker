import React, { useState, useEffect } from 'react';
import './App.css';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import CategoryManager from './components/CategoryManager';
import Dashboard from './components/Dashboard';
import { getExpenses, getCategories, getStats } from './services/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesData, categoriesData, statsData] = await Promise.all([
        getExpenses(),
        getCategories(),
        getStats()
      ]);
      setExpenses(expensesData.expenses || []);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    loadData();
  };

  const handleExpenseUpdated = () => {
    loadData();
  };

  const handleExpenseDeleted = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your expenses and manage your budget</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'expenses' ? 'active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add Expense
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <Dashboard expenses={expenses} categories={categories} stats={stats} />
        )}
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            categories={categories}
            onUpdate={handleExpenseUpdated}
            onDelete={handleExpenseDeleted}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'add' && (
          <ExpenseForm
            categories={categories}
            onExpenseAdded={handleExpenseAdded}
          />
        )}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onCategoryChange={loadData}
          />
        )}
      </main>
    </div>
  );
}

export default App;

