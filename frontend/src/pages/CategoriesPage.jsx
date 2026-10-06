import React, { useState, useEffect } from 'react';
import { Plus, Tags, Edit2, Trash2, Check, Lock } from 'lucide-react';
import { categoryApi } from '../services/api';
import { CategoryModal } from '../components/CategoryModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CategoryIcon } from '../utils/iconMap';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [activeType, setActiveType] = useState('expense'); // 'expense' | 'income'
  const [loading, setLoading] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await categoryApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      setDeleteError(err.message || 'Cannot delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = categories.filter((c) => c.type === activeType);
  const customCats = filtered.filter((c) => !c.isDefault);
  const defaultCats = filtered.filter((c) => c.isDefault);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">
            Organize and classify your income and expense transactions with custom colors and icons.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New Custom Category</span>
        </button>
      </div>

      {/* Expense / Income Toggle Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          className="btn"
          style={{
            backgroundColor: activeType === 'expense' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
            border: activeType === 'expense' ? '1px solid #f43f5e' : '1px solid transparent',
            color: activeType === 'expense' ? '#fb7185' : 'var(--text-secondary)',
            fontWeight: 700
          }}
          onClick={() => setActiveType('expense')}
        >
          Expense Categories ({categories.filter((c) => c.type === 'expense').length})
        </button>

        <button
          className="btn"
          style={{
            backgroundColor: activeType === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: activeType === 'income' ? '1px solid #10b981' : '1px solid transparent',
            color: activeType === 'income' ? '#34d399' : 'var(--text-secondary)',
            fontWeight: 700
          }}
          onClick={() => setActiveType('income')}
        >
          Income Categories ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {deleteError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#fb7185',
            fontSize: '0.85rem'
          }}
        >
          {deleteError}
        </div>
      )}

      {/* User Custom Categories */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          Custom Categories ({customCats.length})
        </h2>

        {customCats.length === 0 ? (
          <div
            className="glass-panel"
            style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}
          >
            No custom {activeType} categories added yet. Click "+ New Custom Category" to create personalized tags!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {customCats.map((cat) => (
              <div
                key={cat._id}
                className="glass-panel glass-panel-interactive"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: cat.color || '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}
                  >
                    <CategoryIcon name={cat.icon || 'tag'} size={18} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cat.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Custom Category</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className="btn btn-secondary btn-icon btn-sm"
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsModalOpen(true);
                    }}
                    title="Edit Category"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-secondary btn-icon btn-sm"
                    onClick={() => {
                      setDeleteError('');
                      setDeleteTarget(cat);
                    }}
                    title="Delete Category"
                    style={{ color: '#fb7185' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Default Categories */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>System Standard Categories ({defaultCats.length})</h2>
          <span className="badge badge-info" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Lock size={10} /> Pre-configured
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {defaultCats.map((cat) => (
            <div
              key={cat._id}
              className="glass-panel"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 0.9
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: `${cat.color || '#6366f1'}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cat.color || '#6366f1'
                  }}
                >
                  <CategoryIcon name={cat.icon || 'tag'} size={18} color={cat.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standard</div>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Built-in</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={fetchCategories}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmText="Delete Category"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
