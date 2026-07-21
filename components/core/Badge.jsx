import React from 'react';

export function Badge({ status = 'unverified', label }) {
  const bg = status === 'verified' ? 'var(--status-verified)' : status === 'seasonal' ? 'var(--ink-soft)' : 'var(--status-unverified)';
  const text = label || (status === 'verified' ? 'Verified' : status === 'seasonal' ? 'Seasonal' : 'Unverified');
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: 'var(--text-mono-badge)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-mid)',
      background: bg,
      color: 'var(--white)'
    }}>
      {text}
    </span>
  );
}
