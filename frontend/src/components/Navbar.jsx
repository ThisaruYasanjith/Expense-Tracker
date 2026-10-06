import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Shield,
  CreditCard,
  Target,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationApi } from '../services/api';

export const Navbar = ({ onOpenTransactionModal, setMobileOpen, setActiveTab }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAsRead('all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationApi.delete('all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle size={16} color="#ef4444" />;
      case 'budget_warning':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'recurring_due':
        return <CreditCard size={16} color="#06b6d4" />;
      case 'goal_milestone':
        return <Target size={16} color="#10b981" />;
      default:
        return <Shield size={16} color="#6366f1" />;
    }
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Left: Mobile hamburger & Quick Search or Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{ display: 'none' }}
          id="mobile-nav-toggle"
        >
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Real-time Finance Engine Active
          </span>
        </div>
      </div>

      {/* Right: Quick Add Button, Notification Bell, Theme Switcher, User currency indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            padding: '0.35rem 0.75rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          Currency: <span style={{ color: 'var(--text-primary)' }}>{user?.currency || 'USD'}</span>
        </div>

        {/* Quick Add Transaction Button */}
        <button
          className="btn btn-primary"
          onClick={() => onOpenTransactionModal()}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>New Transaction</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#6366f1" />}
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setShowNotifications((prev) => !prev)}
            style={{ position: 'relative' }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  borderRadius: '50%',
                  width: 17,
                  height: 17,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-primary)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: 360,
                maxHeight: 440,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'scaleUp 0.15s ease-out'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleMarkAllRead}
                    title="Mark all as read"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  >
                    <CheckCheck size={13} />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearAll}
                    title="Clear all"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 340 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    🎉 No notifications right now. Everything is running smoothly!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <div
                        style={{
                          marginTop: 2,
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-input)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {getNotificationIcon(n.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {n.link && (
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          style={{ width: 24, height: 24 }}
                          onClick={() => {
                            const tab = n.link.replace('/', '');
                            if (tab) setActiveTab(tab);
                            setShowNotifications(false);
                          }}
                        >
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
