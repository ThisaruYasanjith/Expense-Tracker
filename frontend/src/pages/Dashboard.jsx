import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Target,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { transactionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { CategoryIcon } from '../utils/iconMap';

export const Dashboard = ({ onOpenTransactionModal, setActiveTab }) => {
  const { formatCurrency, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }}
          />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading financial intelligence...</div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthIncome: 0,
    monthExpense: 0,
    monthSavings: 0,
    savingsRate: 0
  };

  const monthlyTrends = data?.monthlyTrends || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const recentTransactions = data?.recentTransactions || [];
  const budgets = data?.budgets || [];
  const goals = data?.goals || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Welcome & Quick Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Intelligence Overview</h1>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>. Here is your live financial posture.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('analytics')}>
            Detailed Analytics
          </button>
          <button className="btn btn-primary" onClick={() => onOpenTransactionModal()}>
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid-responsive">
        <MetricCard
          title="Total Net Balance"
          value={formatCurrency(summary.balance)}
          subtitle="All-time accumulated wealth"
          icon={Wallet}
          gradient="linear-gradient(135deg, #6366f1, #3b82f6)"
          trend={summary.balance >= 0 ? '+ Positive' : '- Deficit'}
          trendPositive={summary.balance >= 0}
        />

        <MetricCard
          title="Monthly Income"
          value={formatCurrency(summary.monthIncome)}
          subtitle="Earnings this current month"
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          trend="+ Inflow"
          trendPositive={true}
        />

        <MetricCard
          title="Monthly Expenses"
          value={formatCurrency(summary.monthExpense)}
          subtitle="Total spend this current month"
          icon={TrendingDown}
          gradient="linear-gradient(135deg, #f43f5e, #e11d48)"
          trend="- Outflow"
          trendPositive={false}
        />

        <MetricCard
          title="Monthly Savings Rate"
          value={`${summary.savingsRate}%`}
          subtitle={`Net saved: ${formatCurrency(summary.monthSavings)}`}
          icon={PiggyBank}
          gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
          trend={summary.savingsRate >= 20 ? '🔥 Healthy' : '⚠️ Low'}
          trendPositive={summary.savingsRate >= 20}
        />
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Cash Flow Trends Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Cash Flow & Trend (6 Months)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Income vs Expenses comparison over time</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} /> Income
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f43f5e' }} /> Expenses
              </span>
            </div>
          </div>

          <div style={{ height: 280, width: '100%' }}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: 8,
                      fontSize: '0.85rem'
                    }}
                    formatter={(val) => [formatCurrency(val)]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                    name="Expense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No transaction data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Spending by Category</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This month's expense distribution</p>
          </div>

          <div style={{ flex: 1, minHeight: 220, position: 'relative' }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: 8,
                      fontSize: '0.82rem'
                    }}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No expenses logged this month yet.
              </div>
            )}
          </div>

          {/* Quick Category Legend List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', maxHeight: 110, overflowY: 'auto' }}>
            {categoryBreakdown.slice(0, 4).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: c.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <span style={{ fontWeight: 700 }}>{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Transactions & Active Budgets/Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }}>
        {/* Recent Transactions List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Recent Transactions</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest financial activity</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('transactions')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No transactions yet. Click "+ Add Transaction" to start tracking!
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tx.type === 'income' ? '#34d399' : '#fb7185'
                      }}
                    >
                      <CategoryIcon name={tx.category?.icon || 'tag'} size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {tx.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span>{tx.category?.name || 'General'}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        {tx.isRecurring && (
                          <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: tx.type === 'income' ? '#10b981' : '#f43f5e'
                    }}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Budget Health & Savings Goal Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Budgets Widget */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem' }}>Monthly Budget Health</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live budget tracking</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('budgets')}
                style={{ fontSize: '0.75rem' }}
              >
                Manage
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {budgets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No monthly budgets configured yet. Create a budget to monitor spending!
                </div>
              ) : (
                budgets.slice(0, 3).map((b) => {
                  const isOver = b.spentAmount > b.budgetAmount;
                  const isWarning = b.percentage >= (b.alertThreshold || 80);
                  const progressColor = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

                  return (
                    <div key={b._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <CategoryIcon name={b.category?.icon || 'tag'} size={14} color={b.category?.color} />
                          {b.category?.name}
                        </span>
                        <span style={{ color: isOver ? '#ef4444' : 'var(--text-secondary)' }}>
                          {formatCurrency(b.spentAmount)} / {formatCurrency(b.budgetAmount)} ({b.percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 7,
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
                            backgroundColor: progressColor,
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Savings Goals Widget */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem' }}>Savings Targets</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Goal progress</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('goals')}
                style={{ fontSize: '0.75rem' }}
              >
                View Goals
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {goals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No savings goals set yet. Add a target to stay motivated!
                </div>
              ) : (
                goals.slice(0, 2).map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div
                      key={g._id}
                      style={{
                        padding: '0.85rem',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {g.title}
                        </span>
                        <span
                          className="badge badge-primary"
                          style={{ fontSize: '0.72rem', backgroundColor: `${g.color || '#10b981'}22`, color: g.color || '#10b981' }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                        {formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)} saved
                      </div>
                      <div
                        style={{
                          height: 6,
                          backgroundColor: 'var(--bg-input)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor: g.color || '#10b981',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
