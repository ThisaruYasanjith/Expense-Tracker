import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Repeat,
  BarChart3,
  Tags,
  ShieldCheck,
  Settings,
  LogOut,
  Wallet,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'goals', label: 'Savings Goals', icon: Target },
  { id: 'recurring', label: 'Recurring', icon: Repeat },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'categories', label: 'Categories', icon: Tags }
];

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 998 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
          backdropFilter: 'blur(20px)'
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand / Logo */}
        <div
          style={{
            padding: '1.5rem 1.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Wallet size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                FinPulse
                <span
                  style={{
                    fontSize: '0.62rem',
                    background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                    color: '#fff',
                    padding: '2px 5px',
                    borderRadius: 4,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  PRO
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Financial Intelligence</div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-icon"
            style={{ display: 'none' }}
            id="sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 0.75rem 0.5rem', letterSpacing: '0.05em' }}>
            Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.1) 100%)'
                      : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon
                    size={19}
                    color={isActive ? '#6366f1' : 'var(--text-muted)'}
                    style={{ transition: 'color var(--transition-fast)' }}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdmin && (
              <>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '1.25rem 0.75rem 0.5rem', letterSpacing: '0.05em' }}>
                  Administration
                </div>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeTab === 'admin' ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.18) 0%, rgba(99, 102, 241, 0.1) 100%)' : 'transparent',
                    color: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === 'admin' ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: activeTab === 'admin' ? '3px solid #ec4899' : '3px solid transparent'
                  }}
                >
                  <ShieldCheck size={19} color={activeTab === 'admin' ? '#ec4899' : 'var(--text-muted)'} />
                  <span>Admin Portal</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}
        >
          <div
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              background: activeTab === 'profile' ? 'var(--bg-card-hover)' : 'transparent',
              transition: 'background var(--transition-fast)'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'user@example.com'}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-icon btn-sm"
              title="Profile Settings"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('profile');
              }}
            >
              <Settings size={15} />
            </button>
          </div>

          <button
            className="btn btn-secondary"
            onClick={logout}
            style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem' }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
