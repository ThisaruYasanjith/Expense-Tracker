import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, Tag, FileText } from 'lucide-react';
import { categoryApi, transactionApi } from '../services/api';
import { CategoryIcon } from '../utils/iconMap';

export const TransactionModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load categories
  useEffect(() => {
    if (isOpen) {
      const fetchCats = async () => {
        try {
          const res = await categoryApi.getAll();
          if (res.success) {
            setCategories(res.data);
            if (!transaction && res.data.length > 0) {
              const matched = res.data.filter((c) => c.type === type);
              if (matched.length > 0) setCategory(matched[0]._id);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchCats();
    }
  }, [isOpen, type]);

  // Populate data when editing
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setTitle(transaction.title);
      setAmount(transaction.amount);
      setCategory(transaction.category?._id || transaction.category);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
      setPaymentMethod(transaction.paymentMethod || 'credit_card');
      setNotes(transaction.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setNotes('');
    }
    setError('');
  }, [transaction, isOpen]);

  // When type changes, auto-select first category matching the type
  const handleTypeChange = (newType) => {
    setType(newType);
    const matching = categories.filter((c) => c.type === newType);
    if (matching.length > 0) {
      setCategory(matching[0]._id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || !category) {
      setError('Please fill in title, amount, and choose a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        type,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        paymentMethod,
        notes: notes.trim()
      };

      if (transaction?._id) {
        await transactionApi.update(transaction._id, payload);
      } else {
        await transactionApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '0.65rem 0.95rem',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fb7185',
                  fontSize: '0.84rem',
                  marginBottom: '1rem'
                }}
              >
                {error}
              </div>
            )}

            {/* Type selector (Income / Expense) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}
            >
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: type === 'expense' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-input)',
                  border: type === 'expense' ? '2px solid #f43f5e' : '1px solid var(--border-color)',
                  color: type === 'expense' ? '#fb7185' : 'var(--text-secondary)',
                  fontWeight: 700
                }}
                onClick={() => handleTypeChange('expense')}
              >
                <ArrowDownRight size={18} color="#f43f5e" />
                <span>Expense</span>
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                  border: type === 'income' ? '2px solid #10b981' : '1px solid var(--border-color)',
                  color: type === 'income' ? '#34d399' : 'var(--text-secondary)',
                  fontWeight: 700
                }}
                onClick={() => handleTypeChange('income')}
              >
                <ArrowUpRight size={18} color="#10b981" />
                <span>Income</span>
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Transaction Title / Description *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Grocery shopping, Freelance payment, Rent..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Amount and Category Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {filteredCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Payment Method Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes & Remarks (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Additional details, invoice references, tags..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
