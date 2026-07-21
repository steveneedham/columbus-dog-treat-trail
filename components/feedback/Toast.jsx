import React from 'react';

export function Toast({ open, kind = 'success', message, onClose }) {
  if (!open) return null;
  const color = kind === 'success' ? 'var(--moss)' : kind === 'error' ? 'var(--rust)' : 'var(--ink)';
  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 3000,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--white)', border: `var(--border-default) solid ${color}`, borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)'
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {message}
      {onClose ? (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: 14, padding: 0, marginLeft: 4 }}>✕</button>
      ) : null}
    </div>
  );
}
