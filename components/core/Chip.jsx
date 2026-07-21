import React from 'react';

export function Chip({ label, color, icon, active = true, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 500,
        padding: '6px 10px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        background: active ? 'var(--white)' : 'var(--paper)',
        color: 'var(--ink)',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        textAlign: 'left'
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: color }} />
      {icon ? <img src={icon} alt="" style={{ width: 14, height: 14, flexShrink: 0, opacity: active ? 1 : 0.6 }} /> : null}
      {label}
    </button>
  );
}
