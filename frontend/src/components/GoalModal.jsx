import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { goalApi } from '../services/api';

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Vacation & Travel',
  'Vehicle / Car',
  'Home & Real Estate',
  'Gadget & Tech',
  'Education & Courses',
  'Wedding & Events',
  'Retirement & Investment',
  'Other'
];

const PRESET_COLORS = [
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#f43f5e',
  '#84cc16'
];

export const GoalModal = ({ isOpen, onClose, goal, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(goal.targetAmount);
      setCurrentAmount(goal.currentAmount || 0);
      setTargetDate(new Date(goal.targetDate).toISOString().split('T')[0]);
      setCategory(goal.category || GOAL_CATEGORIES[0]);
      setColor(goal.color || PRESET_COLORS[0]);
      setNotes(goal.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      // Default target date: 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setCategory(GOAL_CATEGORIES[0]);
      setColor(PRESET_COLORS[0]);
      setNotes('');
    }
    setError('');
  }, [goal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || !targetDate) {
      setError('Please provide goal title, target amount and target date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate: new Date(targetDate),
        category,
        color,
        notes: notes.trim()
      };

      if (goal?._id) {
        await goalApi.update(goal._id, payload);
      } else {
        await goalApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save savings goal');
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
            {goal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
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
              <label className="form-label">Goal Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. New Electric Car, Japan Vacation, Emergency Fund..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Target Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-input"
                  placeholder="e.g. 5000.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial / Current Saved</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Target Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {GOAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="form-group">
              <label className="form-label">Accent Theme Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '3px solid #fff' : '2px solid transparent',
                      boxShadow: color === c ? '0 0 8px ' + c : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes & Purpose (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Why are you saving for this? Any target milestones?"
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
              {loading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
