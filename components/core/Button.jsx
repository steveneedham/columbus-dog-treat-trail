import React from 'react';

export function Button({ children, variant = 'default', icon, disabled = false, onClick, type = 'button' }) {
  const isPrimary = variant === 'primary';
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-body)',
        fontWeight: 600,
        padding: '9px 14px',
        borderRadius: 'var(--radius-lg)',
        border: `var(--border-default) solid ${isPrimary ? 'var(--rust)' : 'var(--ink)'}`,
        background: isPrimary ? 'var(--rust)' : 'var(--white)',
        color: isPrimary ? 'var(--white)' : 'var(--ink)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'transform var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)'
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = isPrimary ? 'var(--rust-dark)' : 'var(--ink)'; e.currentTarget.style.borderColor = isPrimary ? 'var(--rust-dark)' : 'var(--ink)'; e.currentTarget.style.color = 'var(--white)'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = isPrimary ? 'var(--rust)' : 'var(--white)'; e.currentTarget.style.borderColor = isPrimary ? 'var(--rust)' : 'var(--ink)'; e.currentTarget.style.color = isPrimary ? 'var(--white)' : 'var(--ink)'; } }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon ? <span>{icon}</span> : null}
      {children}
    </button>
  );
}
