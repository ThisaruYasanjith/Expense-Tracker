import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  PieChart,
  Repeat,
  DollarSign,
  Search,
  Lock,
  Unlock,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const AdminPage = () => {
  const { formatCurrency, user: currentUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Users Filter & Pagination
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status toggle
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ search, role: roleFilter, page: currentPage, limit: 10 })
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) {
        setUsers(usersRes.data);
        setTotalPages(usersRes.totalPages || 1);
        setTotalCount(usersRes.total || 0);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentPage, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAdminData();
  };

  const handleToggleStatus = async (user) => {
    setStatusLoading(true);
    try {
      const res = await adminApi.toggleUserStatus(user._id);
      if (res.success) {
        setActionMessage(res.message);
        setTimeout(() => setActionMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminApi.updateUserRole(user._id, newRole);
      if (res.success) {
        setActionMessage(res.message);
        setTimeout(() => setActionMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteTarget._id);
      setDeleteTarget(null);
      setActionMessage('User and associated records permanently deleted');
      setTimeout(() => setActionMessage(''), 3000);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={28} color="#ec4899" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="page-subtitle">
            System metrics, user monitoring, permissions management, and platform analytics.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#818cf8',
            fontSize: '0.85rem'
          }}
        >
          {actionMessage}
        </div>
      )}

      {/* Platform High-Level Metrics */}
      <div className="grid-responsive">
        <MetricCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          subtitle="System wide user base"
          icon={Users}
          gradient="linear-gradient(135deg, #ec4899, #8b5cf6)"
        />

        <MetricCard
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          subtitle="Income & expense records"
          icon={CreditCard}
          gradient="linear-gradient(135deg, #6366f1, #3b82f6)"
        />

        <MetricCard
          title="Total Platform Volume"
          value={formatCurrency(stats?.totalVolume || 0)}
          subtitle="Cumulative monetary flow"
          icon={DollarSign}
          gradient="linear-gradient(135deg, #10b981, #059669)"
        />

        <MetricCard
          title="Active Budgets"
          value={stats?.totalBudgets || 0}
          subtitle={`${stats?.totalGoals || 0} Active Savings Goals`}
          icon={PieChart}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
        />
      </div>

      {/* User Management Section */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {/* Table Toolbar */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>System User Directory</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Manage credentials, roles, and status for {totalCount} registered members
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem', minWidth: 240 }}
              />
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.6rem 0.95rem' }}>
              Filter
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Transactions</th>
                <th>Currency</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u._id === currentUser?._id;

                  return (
                    <tr key={u._id}>
                      {/* Name & Email */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: u.role === 'admin' ? '#ec4899' : '#6366f1',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem'
                            }}
                          >
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {u.name}
                              {isSelf && (
                                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: u.role === 'admin' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: u.role === 'admin' ? '#ec4899' : '#818cf8',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                          }}
                        >
                          {u.role === 'admin' ? <ShieldCheck size={12} /> : <Users size={12} />}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Transactions Count */}
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>{u.transactionCount || 0}</strong> records
                      </td>

                      {/* Currency */}
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: '0.74rem' }}>
                          {u.currency || 'USD'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Blocked / Active Status */}
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: u.isBlocked ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: u.isBlocked ? '#fb7185' : '#34d399',
                            border: `1px solid ${u.isBlocked ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                          }}
                        >
                          {u.isBlocked ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                          {!isSelf && (
                            <>
                              <button
                                className={`btn btn-icon btn-sm ${u.isBlocked ? 'btn-success' : 'btn-secondary'}`}
                                title={u.isBlocked ? 'Unblock user' : 'Suspend user'}
                                onClick={() => handleToggleStatus(u)}
                                disabled={statusLoading}
                              >
                                {u.isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                              </button>

                              <button
                                className="btn btn-secondary btn-icon btn-sm"
                                title={u.role === 'admin' ? 'Demote to regular user' : 'Promote to Admin'}
                                onClick={() => handleToggleRole(u)}
                              >
                                <Shield size={13} />
                              </button>

                              <button
                                className="btn btn-secondary btn-icon btn-sm"
                                title="Delete user"
                                style={{ color: '#fb7185' }}
                                onClick={() => setDeleteTarget(u)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} />
              <span>Previous</span>
            </button>

            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${deleteTarget?.name}" (${deleteTarget?.email}) and all their financial transactions and budgets? This action cannot be undone.`}
        confirmText="Delete Account"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
