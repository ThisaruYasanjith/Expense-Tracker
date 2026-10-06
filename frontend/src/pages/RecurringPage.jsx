import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Play,
  Pause,
  Zap,
  Edit2,
  Trash2,
  Clock,
  CreditCard,
  Check
} from 'lucide-react';
import { recurringApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RecurringModal } from '../components/RecurringModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CategoryIcon } from '../utils/iconMap';

export const RecurringPage = ({ onOpenTransactionModal }) => {
  const { formatCurrency } = useAuth();

  const [recurringList, setRecurringList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await recurringApi.getAll();
      if (res.success) {
        setRecurringList(res.data);
      }
    } catch (err) {
      console.error('Failed to load recurring rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, []);

  const handleToggleStatus = async (item) => {
    try {
      await recurringApi.toggleStatus(item._id);
      fetchRecurring();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleProcessNow = async (item) => {
    setProcessingId(item._id);
    try {
      const res = await recurringApi.processNow(item._id);
      if (res.success) {
        setSuccessMessage(`Successfully recorded transaction for "${item.title}"`);
        setTimeout(() => setSuccessMessage(''), 4000);
        fetchRecurring();
      }
    } catch (err) {
      console.error('Failed to process recurring item:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await recurringApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchRecurring();
    } catch (err) {
      console.error('Failed to delete recurring rule:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalMonthlyIncome = recurringList
    .filter((r) => r.type === 'income' && r.status === 'active')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalMonthlyExpense = recurringList
    .filter((r) => r.type === 'expense' && r.status === 'active')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Recurring Incomes & Expenses</h1>
          <p className="page-subtitle">
            Automate routine bills, subscriptions, paychecks, and repeating financial commitments.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingRecurring(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New Recurring Schedule</span>
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#34d399',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-responsive">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Scheduled Active Income
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '0.35rem' }}>
            +{formatCurrency(totalMonthlyIncome)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Expected recurring inflow
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Scheduled Active Expenses
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.35rem' }}>
            -{formatCurrency(totalMonthlyExpense)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Fixed monthly obligations & bills
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Net Scheduled Balance
          </span>
          <div
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: totalMonthlyIncome >= totalMonthlyExpense ? '#10b981' : '#f43f5e',
              marginTop: '0.35rem'
            }}
          >
            {formatCurrency(totalMonthlyIncome - totalMonthlyExpense)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Net periodic surplus
          </div>
        </div>
      </div>

      {/* Recurring Items List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recurring Schedules ({recurringList.length})</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-processing active</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            Loading recurring rules...
          </div>
        ) : recurringList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <Repeat size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>No Recurring Schedules Configured</div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Add repeating items like monthly salary, Netflix subscription, gym membership or rent.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title & Category</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Next Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringList.map((item) => (
                  <tr key={item._id}>
                    {/* Title */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: `${item.category?.color || '#6366f1'}22`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: item.category?.color || '#6366f1'
                          }}
                        >
                          <CategoryIcon name={item.category?.icon || 'tag'} size={18} color={item.category?.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {item.category?.name || 'General'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <span className={`badge ${item.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {item.type}
                      </span>
                    </td>

                    {/* Frequency */}
                    <td style={{ textTransform: 'capitalize', fontSize: '0.84rem' }}>
                      <span className="badge badge-info">{item.frequency}</span>
                    </td>

                    {/* Next Due Date */}
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        <span>{new Date(item.nextDueDate).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td style={{ fontWeight: 800, fontSize: '0.95rem', color: item.type === 'income' ? '#10b981' : '#f43f5e' }}>
                      {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        className={`btn btn-sm ${item.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                        onClick={() => handleToggleStatus(item)}
                      >
                        {item.status === 'active' ? <Play size={11} /> : <Pause size={11} />}
                        <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Record this transaction now"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-secondary)' }}
                          disabled={processingId === item._id}
                          onClick={() => handleProcessNow(item)}
                        >
                          <Zap size={13} />
                          <span>{processingId === item._id ? 'Processing...' : 'Process Now'}</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Edit rule"
                          onClick={() => {
                            setEditingRecurring(item);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Delete rule"
                          style={{ color: '#fb7185' }}
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recurring Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recurring={editingRecurring}
        onSuccess={fetchRecurring}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Recurring Rule"
        message={`Are you sure you want to remove the recurring rule "${deleteTarget?.title}"?`}
        confirmText="Delete Rule"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
