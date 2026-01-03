import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getExpenses = async (params = {}) => {
  const response = await api.get('/expenses', { params });
  return response.data;
};

export const getExpense = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await api.put(`/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const getStats = async (params = {}) => {
  const response = await api.get('/expenses/stats/summary', { params });
  return response.data;
};

export const exportToCSV = async (params = {}) => {
  const response = await api.get('/expenses/export/csv', {
    params,
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'expenses.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (name, categoryData) => {
  const response = await api.put(`/categories/${name}`, categoryData);
  return response.data;
};

export const deleteCategory = async (name) => {
  const response = await api.delete(`/categories/${name}`);
  return response.data;
};

export const getBudgetStatus = async (name, params = {}) => {
  const response = await api.get(`/categories/${name}/budget-status`, { params });
  return response.data;
};

