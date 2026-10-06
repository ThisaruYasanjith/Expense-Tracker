const API_URL = '/api';

// Helper to make API requests with JWT auth
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('expense_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);

    // If unauthorized or token expired, clean up token
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('expense_token');
      localStorage.removeItem('expense_user');
      window.location.href = '#login';
    }

    // Handle CSV or file downloads
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      const blob = await res.blob();
      return blob;
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'An error occurred while processing request');
    }
    return data;
  } catch (error) {
    throw error;
  }
};

// API Services
export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data) => request('/auth/password', { method: 'PUT', body: JSON.stringify(data) })
};

export const transactionApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions?${query}`);
  },
  getById: (id) => request(`/transactions/${id}`),
  create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  getDashboard: () => request('/transactions/dashboard'),
  getAnalytics: (timeRange = 'year') => request(`/transactions/analytics?timeRange=${timeRange}`)
};

export const categoryApi = {
  getAll: (type) => request(`/categories${type ? `?type=${type}` : ''}`),
  create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
};

export const budgetApi = {
  getAll: (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    return request(`/budgets?${params.toString()}`);
  },
  create: (data) => request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' })
};

export const goalApi = {
  getAll: () => request('/goals'),
  create: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  contribute: (id, amount, action = 'deposit') =>
    request(`/goals/${id}/contribute`, { method: 'POST', body: JSON.stringify({ amount, action }) }),
  delete: (id) => request(`/goals/${id}`, { method: 'DELETE' })
};

export const recurringApi = {
  getAll: () => request('/recurring'),
  create: (data) => request('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleStatus: (id) => request(`/recurring/${id}/toggle`, { method: 'PATCH' }),
  processNow: (id) => request(`/recurring/${id}/process`, { method: 'POST' }),
  delete: (id) => request(`/recurring/${id}`, { method: 'DELETE' })
};

export const notificationApi = {
  getAll: () => request('/notifications'),
  markAsRead: (id = 'all') => request(`/notifications/${id}/read`, { method: 'PUT' }),
  delete: (id = 'all') => request(`/notifications/${id}`, { method: 'DELETE' })
};

export const adminApi = {
  getStats: () => request('/admin/stats'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users?${query}`);
  },
  toggleUserStatus: (id) => request(`/admin/users/${id}/status`, { method: 'PATCH' }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' })
};

export const reportApi = {
  getStatement: (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/reports/statement?${params.toString()}`);
  },
  exportCSV: async (startDate, endDate, type) => {
    const token = localStorage.getItem('expense_token');
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);

    const res = await fetch(`${API_URL}/reports/export-csv?${params.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
