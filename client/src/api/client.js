import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendors
export const vendorsApi = {
  getAll: () => api.get('/vendors').then(r => r.data),
  getById: (id) => api.get(`/vendors/${id}`).then(r => r.data),
  create: (data) => api.post('/vendors', data).then(r => r.data),
  update: (id, data) => api.put(`/vendors/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/vendors/${id}`).then(r => r.data),
};

// Services
export const servicesApi = {
  getAll: (params) => api.get('/services', { params }).then(r => r.data),
  getById: (id) => api.get(`/services/${id}`).then(r => r.data),
  create: (data) => api.post('/services', data).then(r => r.data),
  update: (id, data) => api.put(`/services/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/services/${id}`).then(r => r.data),
};

// Transactions
export const transactionsApi = {
  getAll: (params) => api.get('/transactions', { params }).then(r => r.data),
  getById: (id) => api.get(`/transactions/${id}`).then(r => r.data),
  create: (data) => api.post('/transactions', data).then(r => r.data),
  update: (id, data) => api.put(`/transactions/${id}`, data).then(r => r.data),
  updateStatus: (id, data) => api.patch(`/transactions/${id}/status`, data).then(r => r.data),
  bulkUpdateStatus: (data) => api.patch('/transactions/bulk/status', data).then(r => r.data),
  delete: (id) => api.delete(`/transactions/${id}`).then(r => r.data),
  markOverdue: () => api.post('/transactions/mark-overdue').then(r => r.data),
};

// Budgets
export const budgetsApi = {
  getAll: (params) => api.get('/budgets', { params }).then(r => r.data),
  getByYear: (year) => api.get(`/budgets/${year}`).then(r => r.data),
  getVsActual: (year) => api.get(`/budgets/${year}/vs-actual`).then(r => r.data),
  create: (data) => api.post('/budgets', data).then(r => r.data),
  update: (id, data) => api.put(`/budgets/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/budgets/${id}`).then(r => r.data),
  getYears: () => api.get('/budgets/meta/years').then(r => r.data),
};

// Dashboard
export const dashboardApi = {
  getSummary: (year) => api.get('/dashboard/summary', { params: { year } }).then(r => r.data),
  getMonthlyTrend: (year) => api.get('/dashboard/monthly-trend', { params: { year } }).then(r => r.data),
  getVendorDistribution: (year) => api.get('/dashboard/vendor-distribution', { params: { year } }).then(r => r.data),
  getBudgetVsActual: (year) => api.get('/dashboard/budget-vs-actual', { params: { year } }).then(r => r.data),
  getRecentTransactions: (limit) => api.get('/dashboard/recent-transactions', { params: { limit } }).then(r => r.data),
};

// Reports
export const reportsApi = {
  exportTransactionsCsv: (params) => `/api/reports/transactions/csv?${new URLSearchParams(params)}`,
  exportTransactionsExcel: (params) => `/api/reports/transactions/excel?${new URLSearchParams(params)}`,
  exportBudgetExcel: (year) => `/api/reports/budget/excel?year=${year}`,
  getTransactionPdf: (id) => `/api/reports/transactions/${id}/pdf`,
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications').then(r => r.data),
  getCount: () => api.get('/notifications/count').then(r => r.data),
};

// Settings
export const settingsApi = {
  getAll: () => api.get('/settings').then(r => r.data),
  update: (data) => api.put('/settings', data).then(r => r.data),
  getGlAccounts: () => api.get('/settings/meta/gl-accounts').then(r => r.data),
};

export default api;
