import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'linear-gradient(135deg, #6366f1, #06b6d4)',
  trend,
  trendLabel,
  trendPositive = true
}) => {
  return (
    <div
      className="glass-panel glass-panel-interactive"
      style={{
        padding: '1.4rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Background soft glow accent */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: gradient,
          opacity: 0.12,
          borderRadius: '50%',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '0.35rem',
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-main)'
            }}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.78rem' }}>
        {trend && (
          <span
            style={{
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: trendPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: trendPositive ? '#10b981' : '#f43f5e'
            }}
          >
            {trend}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>{subtitle || trendLabel}</span>
      </div>
    </div>
  );
};
