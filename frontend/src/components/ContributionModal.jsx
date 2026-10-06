import React, { useState } from 'react';
import { X, PlusCircle, MinusCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { goalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ContributionModal = ({ isOpen, onClose, goal, onSuccess }) => {
  const { formatCurrency } = useAuth();
  const [action, setAction] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await goalApi.contribute(goal._id, parseFloat(amount), action);

      // If goal completed after deposit, launch confetti celebration!
      if (action === 'deposit' && res.data && res.data.currentAmount >= res.data.targetAmount) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#10b981" />
            <span>Manage Goal Funds: {goal.title}</span>
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

            {/* Current status card */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Balance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {formatCurrency(goal.currentAmount)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Goal</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(goal.targetAmount)}
                </div>
              </div>
            </div>

            {/* Action selector */}
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
                  backgroundColor: action === 'deposit' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                  border: action === 'deposit' ? '2px solid #10b981' : '1px solid var(--border-color)',
                  color: action === 'deposit' ? '#34d399' : 'var(--text-secondary)',
                  fontWeight: 700
                }}
                onClick={() => setAction('deposit')}
              >
                <PlusCircle size={18} color="#10b981" />
                <span>Deposit Savings</span>
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  backgroundColor: action === 'withdraw' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-input)',
                  border: action === 'withdraw' ? '2px solid #f43f5e' : '1px solid var(--border-color)',
                  color: action === 'withdraw' ? '#fb7185' : 'var(--text-secondary)',
                  fontWeight: 700
                }}
                onClick={() => setAction('withdraw')}
              >
                <MinusCircle size={18} color="#f43f5e" />
                <span>Withdraw Funds</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Contribution Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Quick amount pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setAmount(q.toString())}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${action === 'deposit' ? 'btn-primary' : 'btn-danger'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : action === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
