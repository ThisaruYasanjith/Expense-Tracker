import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { categoryApi } from '../services/api';
import { ICONS_MAP, CategoryIcon } from '../utils/iconMap';

const AVAILABLE_ICONS = Object.keys(ICONS_MAP);
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
  '#64748b'
];

export const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setIcon(category.icon || 'tag');
      setColor(category.color || '#6366f1');
    } else {
      setName('');
      setType('expense');
      setIcon('tag');
      setColor('#6366f1');
    }
    setError('');
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        type,
        icon,
        color
      };

      if (category?._id) {
        await categoryApi.update(category._id, payload);
      } else {
        await categoryApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category');
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
            {category ? 'Edit Custom Category' : 'Create Custom Category'}
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
            {!category && (
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
                  Expense Category
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
                  Income Category
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pet Care, Software Subscriptions, Side Hustle..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Color Palette Picker */}
            <div className="form-group">
              <label className="form-label">Color Swatch</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '3px solid #ffffff' : '2px solid transparent',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {color === c && <Check size={14} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Icon Selection</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                  gap: '0.45rem',
                  maxHeight: 160,
                  overflowY: 'auto',
                  padding: '0.5rem',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: icon === ic ? color : 'transparent',
                      color: icon === ic ? '#ffffff' : 'var(--text-secondary)',
                      border: icon === ic ? '1px solid #fff' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <CategoryIcon name={ic} size={18} color={icon === ic ? '#fff' : 'currentColor'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Banner */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <CategoryIcon name={icon} size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name || 'Category Preview'}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {type === 'expense' ? 'Expense Category' : 'Income Category'}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
