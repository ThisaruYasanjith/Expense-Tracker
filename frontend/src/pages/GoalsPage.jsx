import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
  Award
} from 'lucide-react';
import { goalApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GoalModal } from '../components/GoalModal';
import { ContributionModal } from '../components/ContributionModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MetricCard } from '../components/MetricCard';

export const GoalsPage = () => {
  const { formatCurrency } = useAuth();

  const [goals, setGoals] = useState([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await goalApi.getAll();
      if (res.success) {
        setGoals(res.data);
        setTotalTarget(res.totalTarget || 0);
        setTotalSaved(res.totalSaved || 0);
        setOverallProgress(res.overallProgress || 0);
      }
    } catch (err) {
      console.error('Failed to load savings goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await goalApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals & Milestones</h1>
          <p className="page-subtitle">
            Plan, deposit, and track progress toward your dream purchases, investments, and rainy-day funds.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid-responsive">
        <MetricCard
          title="Total Target Ambition"
          value={formatCurrency(totalTarget)}
          subtitle="Sum of all active goal targets"
          icon={Target}
          gradient="linear-gradient(135deg, #6366f1, #06b6d4)"
        />

        <MetricCard
          title="Total Saved So Far"
          value={formatCurrency(totalSaved)}
          subtitle={`${overallProgress}% toward total goal portfolio`}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          trend={`+ ${overallProgress}%`}
          trendPositive={true}
        />

        <MetricCard
          title="Remaining to Save"
          value={formatCurrency(Math.max(0, totalTarget - totalSaved))}
          subtitle="Remaining capital needed to reach 100%"
          icon={Award}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
        />
      </div>

      {/* Goals Showcase Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Savings Goals</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {goals.filter((g) => g.isCompleted).length} of {goals.length} Completed
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <Sparkles size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>No Savings Goals Yet</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Set a goal for an Emergency Fund, a New Car, or a Dream Vacation to track milestone progress.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Create Your First Goal</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.35rem' }}>
            {goals.map((g) => {
              const pct = g.percentage || 0;
              const isDone = g.isCompleted || pct >= 100;

              return (
                <div
                  key={g._id}
                  className="glass-panel glass-panel-interactive"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Background soft ambient glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: g.color || '#10b981'
                    }}
                  />

                  {/* Header Row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: `${g.color || '#10b981'}22`,
                            color: g.color || '#10b981',
                            fontSize: '0.72rem',
                            marginBottom: '0.45rem'
                          }}
                        >
                          {g.category || 'Savings'}
                        </span>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>{g.title}</h3>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => {
                            setEditingGoal(g);
                            setIsGoalModalOpen(true);
                          }}
                          title="Edit Goal"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => setDeleteTarget(g)}
                          title="Delete Goal"
                          style={{ color: '#fb7185' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {g.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                        {g.notes}
                      </p>
                    )}

                    {/* Progress Stats */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Saved</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: g.color || '#10b981' }}>
                          {formatCurrency(g.currentAmount)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(g.targetAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <div
                        style={{
                          height: 10,
                          backgroundColor: 'var(--bg-input)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor: g.color || '#10b981',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.65rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {isDone ? (
                          <strong style={{ color: '#10b981' }}>Goal Achieved! 🎉</strong>
                        ) : g.isOverdue ? (
                          <strong style={{ color: '#f43f5e' }}>Target Date Passed</strong>
                        ) : (
                          `${g.daysRemaining} days left`
                        )}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      gap: '0.65rem'
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.82rem' }}
                      onClick={() => setContributingGoal(g)}
                    >
                      <DollarSign size={15} />
                      <span>Deposit / Withdraw</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goal={editingGoal}
        onSuccess={fetchGoals}
      />

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
        onSuccess={fetchGoals}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All recorded progress will be removed.`}
        confirmText="Delete Goal"
        isDanger={true}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
