import React from 'react';

export function Panel({ label, children }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: 'var(--border-default) solid var(--ink)',
      borderRadius: 'var(--radius-lg)',
      padding: 10,
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)'
    }}>
      {label ? (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wide)',
          color: 'var(--ink-soft)',
          marginBottom: 2
        }}>{label}</div>
      ) : null}
      {children}
    </div>
  );
}
