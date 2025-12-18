const API_URL = 'http://localhost:5000/api';

export const api = {
  auth: {
    register: async (data) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    login: async (data) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    updatePassword: async (data, token) => {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  users: {
    getAll: async (token, params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/users?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getById: async (id, token) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    create: async (data, token) => {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  stores: {
    getAll: async (token, params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/stores?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    getMyStore: async (token) => {
      const res = await fetch(`${API_URL}/stores/my-store`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    create: async (data, token) => {
      const res = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  },
  ratings: {
    submit: async (data, token) => {
      const res = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    getForStore: async (storeId, token) => {
      const res = await fetch(`${API_URL}/ratings/store/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  },
  dashboard: {
    getStats: async (token) => {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  }
};