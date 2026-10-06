import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  TrendingDown,
  PieChart,
  ShieldAlert
} from 'lucide-react';
import { budgetApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BudgetModal } from '../components/BudgetModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CategoryIcon } from '../utils/iconMap';
import { MetricCard } from '../components/MetricCard';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BudgetsPage = () => {
  const { formatCurrency } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getAll(selectedMonth, selectedYear);
      if (res.success) {
        setBudgets(res.data);
        setSummary({
          totalBudget: res.totalBudget || 0,
          totalSpent: res.totalSpent || 0,
          totalRemaining: res.totalRemaining || 0
        });
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await budgetApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const overallPercentage =
    summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Controls */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly Budgets & Spending Limits</h1>
          <p className="page-subtitle">
            Set proactive category spending limits and receive automated warnings before you overspend.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Month & Year Filter */}
          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-input)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <select
              className="form-select"
              style={{ border: 'none', background: 'transparent', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ border: 'none', background: 'transparent', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid-responsive">
        <MetricCard
          title="Total Budget Cap"
          value={formatCurrency(summary.totalBudget)}
          subtitle={`Allocated for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
          icon={PieChart}
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
        />

        <MetricCard
          title="Total Spent"
          value={formatCurrency(summary.totalSpent)}
          subtitle={`${overallPercentage}% of total budget cap used`}
          icon={TrendingDown}
          gradient="linear-gradient(135deg, #06b6d4, #0284c7)"
          trend={overallPercentage > 100 ? '⚠️ Exceeded' : `${overallPercentage}% used`}
          trendPositive={overallPercentage <= 100}
        />

        <MetricCard
          title="Remaining Budget"
          value={formatCurrency(summary.totalRemaining)}
          subtitle="Available for rest of the month"
          icon={CheckCircle2}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          trend={summary.totalRemaining > 0 ? '+ Available' : '0 Exhausted'}
          trendPositive={summary.totalRemaining > 0}
        />
      </div>

      {/* Budgets Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Category Spending Limits</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {budgets.length} Category {budgets.length === 1 ? 'Budget' : 'Budgets'} active
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            Loading budgets...
          </div>
        ) : budgets.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1'
              }}
            >
              <PieChart size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>No Budgets Configured for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Set monthly limits for categories like Food, Utilities, or Entertainment to stay financially on track.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Set Your First Budget</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {budgets.map((b) => {
              const isExceeded = b.percentage >= 100;
              const isNearLimit = b.percentage >= (b.alertThreshold || 80);
              const statusColor = isExceeded ? '#ef4444' : isNearLimit ? '#f59e0b' : '#10b981';

              return (
                <div
                  key={b._id}
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: `4px solid ${statusColor}`
                  }}
                >
                  {/* Top: Category Title & Actions */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: `${b.category?.color || '#6366f1'}22`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: b.category?.color || '#6366f1'
                          }}
                        >
                          <CategoryIcon name={b.category?.icon || 'tag'} size={20} color={b.category?.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.category?.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Alert at {b.alertThreshold || 80}% usage
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => {
                            setEditingBudget(b);
                            setIsModalOpen(true);
                          }}
                          title="Edit Budget"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => setDeleteTarget(b)}
                          title="Delete Budget"
                          style={{ color: '#fb7185' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Spend Metrics */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spent</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>
                          {formatCurrency(b.spentAmount)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Limit</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(b.amount)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: '0.85rem' }}>
                      <div
                        style={{
                          height: 8,
                          backgroundColor: 'var(--bg-input)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, b.percentage)}%`,
                            backgroundColor: statusColor,
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div
                    style={{
                      marginTop: '1.15rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      {isExceeded
                        ? `Over budget by ${formatCurrency(b.spentAmount - b.amount)}`
                        : `${formatCurrency(b.remainingAmount)} remaining`}
                    </span>

                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${statusColor}22`,
                        color: statusColor,
                        fontSize: '0.72rem'
                      }}
                    >
                      {isExceeded ? '⚠️ Over Budget' : isNearLimit ? '🔔 Warning' : '✅ On Track'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budget={editingBudget}
        month={selectedMonth}
        year={selectedYear}
        onSuccess={fetchBudgets}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Category Budget"
        message={`Are you sure you want to remove the budget for "${deleteTarget?.category?.name}" (${formatCurrency(deleteTarget?.amount || 0)})?`}
        confirmText="Remove Budget"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
