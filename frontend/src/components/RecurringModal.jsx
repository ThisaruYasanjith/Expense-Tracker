import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, Repeat } from 'lucide-react';
import { categoryApi, recurringApi } from '../services/api';

export const RecurringModal = ({ isOpen, onClose, recurring, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchCats = async () => {
        try {
          const res = await categoryApi.getAll();
          if (res.success) {
            setCategories(res.data);
            if (!recurring && res.data.length > 0) {
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

  useEffect(() => {
    if (recurring) {
      setTitle(recurring.title);
      setType(recurring.type);
      setAmount(recurring.amount);
      setCategory(recurring.category?._id || recurring.category);
      setFrequency(recurring.frequency || 'monthly');
      setStartDate(new Date(recurring.startDate).toISOString().split('T')[0]);
      setNextDueDate(new Date(recurring.nextDueDate).toISOString().split('T')[0]);
      setPaymentMethod(recurring.paymentMethod || 'credit_card');
      setNotes(recurring.notes || '');
    } else {
      setTitle('');
      setType('expense');
      setAmount('');
      setFrequency('monthly');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setNotes('');
    }
    setError('');
  }, [recurring, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || !category) {
      setError('Please provide title, amount and category');
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
        frequency,
        startDate: new Date(startDate),
        nextDueDate: new Date(nextDueDate),
        paymentMethod,
        notes: notes.trim()
      };

      if (recurring?._id) {
        await recurringApi.update(recurring._id, payload);
      } else {
        await recurringApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save recurring item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {recurring ? 'Edit Recurring Rule' : 'Schedule Recurring Transaction'}
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

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

            {/* Type selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: type === 'expense' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-input)',
                  border: type === 'expense' ? '2px solid #f43f5e' : '1px solid var(--border-color)',
                  color: type === 'expense' ? '#fb7185' : 'var(--text-secondary)',
                  fontWeight: 700
                }}
                onClick={() => setType('expense')}
              >
                <ArrowDownRight size={18} color="#f43f5e" />
                <span>Recurring Expense</span>
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
                onClick={() => setType('income')}
              >
                <ArrowUpRight size={18} color="#10b981" />
                <span>Recurring Income</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Subscription / Bill / Income Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Netflix Subscription, Apartment Rent, Monthly Salary..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

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
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="" disabled>
                    Select Category
                  </option>
                  {filteredCategories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Frequency *</label>
                <select className="form-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly (Every 2 Weeks)</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Next Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Billing cycle details, cancellation reminder, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : recurring ? 'Update Rule' : 'Save Recurring Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
