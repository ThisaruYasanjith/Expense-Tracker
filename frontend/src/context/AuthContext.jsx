import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('expense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('expense_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('expense_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('expense_token', res.token);
      localStorage.setItem('expense_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password, currency = 'USD') => {
    const res = await authApi.register({ name, email, password, currency });
    if (res.success) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('expense_token', res.token);
      localStorage.setItem('expense_user', JSON.stringify(res.user));
    }
    return res;
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('expense_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('expense_token');
    localStorage.removeItem('expense_user');
  };

  const formatCurrency = (amount) => {
    const curr = user?.currency || 'USD';
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      LKR: 'Rs. ',
      INR: '₹',
      CAD: 'CA$',
      AUD: 'A$',
      JPY: '¥'
    };

    const symbol = currencySymbols[curr] || `${curr} `;
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        formatCurrency
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
