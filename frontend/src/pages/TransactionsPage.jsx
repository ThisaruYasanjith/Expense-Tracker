import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { transactionApi, categoryApi, reportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryIcon } from '../utils/iconMap';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const TransactionsPage = ({ onOpenTransactionModal, onEditTransaction }) => {
  const { formatCurrency, user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder
      };
      if (search.trim()) params.search = search.trim();
      if (type) params.type = type;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const res = await transactionApi.getAll(params);
      if (res.success) {
        setTransactions(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, sortBy, sortOrder, type, category]);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
    setTimeout(() => {
      fetchTransactions();
    }, 50);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await transactionApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      await reportApi.exportCSV(startDate, endDate, type);
    } catch (err) {
      console.error('Export CSV error:', err);
    }
  };

  // Export to PDF using jsPDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      // Title & Metadata
      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241);
      doc.text('FinPulse Financial Statement', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`User: ${user?.name || 'User'} (${user?.email || ''})`, 14, 29);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
      if (startDate || endDate) {
        doc.text(`Period: ${startDate || 'Earliest'} to ${endDate || 'Latest'}`, 14, 41);
      }

      const tableData = transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.title,
        t.type.toUpperCase(),
        t.category?.name || 'Uncategorized',
        `${t.type === 'income' ? '+' : '-'} ${t.amount.toFixed(2)}`,
        t.paymentMethod || 'other',
        t.notes || ''
      ]);

      autoTable(doc, {
        startY: startDate || endDate ? 46 : 40,
        head: [['Date', 'Title', 'Type', 'Category', `Amount (${user?.currency || 'USD'})`, 'Method', 'Notes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8.5 }
      });

      doc.save(`financial_statement_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Export PDF error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions Ledger</h1>
          <p className="page-subtitle">
            Search, filter, categorize, and export your entire income and expense history.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV Spreadsheet">
            <FileSpreadsheet size={16} color="#10b981" />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF} title="Download PDF Statement">
            <FileText size={16} color="#f43f5e" />
            <span>Download PDF</span>
          </button>
          <button className="btn btn-primary" onClick={() => onOpenTransactionModal()}>
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <form onSubmit={handleApplyFilter}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              alignItems: 'flex-end'
            }}
          >
            {/* Search */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Keyword search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.2rem' }}
                />
                <Search
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* Type */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transaction Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Types</option>
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Filter size={15} />
                <span>Filter</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                title="Reset Filters"
                onClick={handleResetFilters}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Transactions Table Panel */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Showing {transactions.length} of {totalCount} records
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="amount_desc">Amount (Highest First)</option>
              <option value="amount_asc">Amount (Lowest First)</option>
              <option value="title_asc">Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No matching transactions found. Try adjusting filters or create a new transaction.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id}>
                    {/* Date */}
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Title & Notes */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.title}</div>
                      {tx.notes && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {tx.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${tx.category?.color || '#6366f1'}18`,
                          color: tx.category?.color || 'var(--text-primary)',
                          border: `1px solid ${tx.category?.color || '#6366f1'}33`
                        }}
                      >
                        <CategoryIcon name={tx.category?.icon || 'tag'} size={12} color={tx.category?.color} />
                        <span>{tx.category?.name || 'General'}</span>
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {tx.paymentMethod ? tx.paymentMethod.replace('_', ' ') : 'Card'}
                      {tx.isRecurring && (
                        <span className="badge badge-info" style={{ marginLeft: 6, fontSize: '0.65rem' }}>
                          Recurring
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td
                      style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: tx.type === 'income' ? '#10b981' : '#f43f5e'
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Edit transaction"
                          onClick={() => onEditTransaction(tx)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Delete transaction"
                          style={{ color: '#fb7185' }}
                          onClick={() => setDeleteTarget(tx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}" (${deleteTarget ? formatCurrency(deleteTarget.amount) : ''})?`}
        confirmText="Delete Transaction"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
