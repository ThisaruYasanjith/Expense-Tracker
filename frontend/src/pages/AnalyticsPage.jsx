import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { transactionApi, reportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryIcon } from '../utils/iconMap';

export const AnalyticsPage = () => {
  const { formatCurrency, user } = useAuth();

  const [timeRange, setTimeRange] = useState('year');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Statement Generator Range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];
  const [stmtStart, setStmtStart] = useState(firstDay);
  const [stmtEnd, setStmtEnd] = useState(today);
  const [statement, setStatement] = useState(null);
  const [stmtLoading, setStmtLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getAnalytics(timeRange);
      if (res.success) {
        setAnalyticsData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatement = async () => {
    setStmtLoading(true);
    try {
      const res = await reportApi.getStatement(stmtStart, stmtEnd);
      if (res.success) {
        setStatement(res);
      }
    } catch (err) {
      console.error('Failed to load statement data:', err);
    } finally {
      setStmtLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    fetchStatement();
  }, [stmtStart, stmtEnd]);

  // Export CSV
  const handleExportCSV = async () => {
    try {
      await reportApi.exportCSV(stmtStart, stmtEnd);
    } catch (err) {
      console.error('CSV Export Error:', err);
    }
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!statement) return;
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241);
      doc.text('FinPulse Financial Intelligence Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Account Holder: ${user?.name || 'User'} (${user?.email || ''})`, 14, 27);
      doc.text(`Statement Period: ${stmtStart} to ${stmtEnd}`, 14, 33);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 39);

      // Financial Summary Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 45, 182, 24, 3, 3, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Total Income', 20, 53);
      doc.text('Total Expenses', 75, 53);
      doc.text('Net Savings', 130, 53);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`+${statement.summary.totalIncome.toFixed(2)}`, 20, 62);
      doc.setTextColor(244, 63, 94);
      doc.text(`-${statement.summary.totalExpense.toFixed(2)}`, 75, 62);
      doc.setTextColor(99, 102, 241);
      doc.text(`${statement.summary.netSavings.toFixed(2)}`, 130, 62);

      const tableRows = statement.transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.title,
        t.type.toUpperCase(),
        t.category?.name || 'General',
        `${t.type === 'income' ? '+' : '-'} ${t.amount.toFixed(2)}`,
        t.paymentMethod || 'card'
      ]);

      autoTable(doc, {
        startY: 76,
        head: [['Date', 'Description', 'Type', 'Category', `Amount (${user?.currency || 'USD'})`, 'Method']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
        styles: { fontSize: 8.5 }
      });

      doc.save(`financial_report_${stmtStart}_to_${stmtEnd}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    }
  };

  const expenseCategories = analyticsData?.expenseByCategory || [];
  const paymentMethods = analyticsData?.paymentMethods || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header & Time Range Selector */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Financial Reports</h1>
          <p className="page-subtitle">
            Deep dive into spending distributions, payment channels, and generate custom period statements.
          </p>
        </div>

        {/* Range Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'month', label: '1 Month' },
            { id: '6months', label: '6 Months' },
            { id: 'year', label: '1 Year' },
            { id: 'all', label: 'All Time' }
          ].map((r) => (
            <button
              key={r.id}
              className="btn btn-sm"
              style={{
                backgroundColor: timeRange === r.id ? 'var(--accent-primary)' : 'transparent',
                color: timeRange === r.id ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 600
              }}
              onClick={() => setTimeRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Section: Category Breakdown & Payment Methods */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Category Expenses Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Category-Wise Total Spending</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ranked expenditure by category</p>
          </div>

          <div style={{ height: 300, width: '100%' }}>
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseCategories} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: 8,
                      fontSize: '0.85rem'
                    }}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No expense data found in this time range.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Payment Methods</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Spending across card, cash, bank</p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
            {paymentMethods.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No payment data available.
              </div>
            ) : (
              paymentMethods.map((pm, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <CreditCard size={17} color="var(--accent-secondary)" />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>
                      {pm._id ? pm._id.replace('_', ' ') : 'Other'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatCurrency(pm.total)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pm.count} transactions</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Statement & Report Generator Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Export Financial Statement & Tax Report</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Select custom date boundaries to generate and export audit-ready PDF or CSV reports.
            </p>
          </div>

          {/* Date controls and Export buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--bg-input)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <Calendar size={14} color="var(--text-muted)" />
              <input
                type="date"
                value={stmtStart}
                onChange={(e) => setStmtStart(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                value={stmtEnd}
                onChange={(e) => setStmtEnd(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>

            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} color="#10b981" />
              <span>Export CSV</span>
            </button>

            <button className="btn btn-primary" onClick={handleExportPDF}>
              <FileText size={16} />
              <span>Export PDF Statement</span>
            </button>
          </div>
        </div>

        {/* Statement Summary Card */}
        {statement && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period Inflow</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                +{formatCurrency(statement.summary.totalIncome)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Period Outflow</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e', marginTop: '2px' }}>
                -{formatCurrency(statement.summary.totalExpense)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Period Savings</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: statement.summary.netSavings >= 0 ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
                {formatCurrency(statement.summary.netSavings)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Savings Rate</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '2px' }}>
                {statement.summary.savingsRate}%
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Transactions</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {statement.summary.totalTransactions}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
