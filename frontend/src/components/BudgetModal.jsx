import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { categoryApi, budgetApi } from '../services/api';

export const BudgetModal = ({ isOpen, onClose, budget, month, year, onSuccess }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchExpenseCategories = async () => {
        try {
          const res = await categoryApi.getAll('expense');
          if (res.success) {
            setCategories(res.data);
            if (!budget && res.data.length > 0) {
              setCategory(res.data[0]._id);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchExpenseCategories();
    }
  }, [isOpen, budget]);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category?._id || budget.category);
      setAmount(budget.amount);
      setAlertThreshold(budget.alertThreshold || 80);
    } else {
      setAmount('');
      setAlertThreshold(80);
    }
    setError('');
  }, [budget, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) {
      setError('Please choose a category and specify budget limit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        category,
        amount: parseFloat(amount),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        alertThreshold: parseInt(alertThreshold, 10)
      };

      if (budget?._id) {
        await budgetApi.update(budget._id, payload);
      } else {
        await budgetApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {budget ? 'Edit Category Budget' : 'Set Category Monthly Budget'}
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

            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!!budget}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Budget Limit *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-input"
                placeholder="e.g. 500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Early Alert Threshold</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {alertThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                You will receive a notification alert once your spending reaches {alertThreshold}% of this budget.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : budget ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
