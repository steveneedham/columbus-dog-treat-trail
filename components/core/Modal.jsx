import React from 'react';

export function Modal({ open, title, children, ctaLabel, ctaHref, onClose }) {
  if (!open) return null;
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose && onClose(); }} style={{
      position: 'fixed', inset: 0, background: 'var(--backdrop-scrim)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--white)', border: 'var(--border-thick) solid var(--ink)', borderRadius: 'var(--radius-xl)',
        padding: 24, width: 'min(360px, 90vw)', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-md)', margin: '0 0 6px', color: 'var(--ink)' }}>{title}</h2>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 'var(--leading-normal)', margin: '0 0 16px' }}>{children}</div>
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', justifyContent: 'center', width: '100%', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          padding: '9px 14px', borderRadius: 'var(--radius-lg)', border: 'var(--border-default) solid var(--rust)',
          background: 'var(--rust)', color: 'var(--white)', textDecoration: 'none', boxSizing: 'border-box'
        }}>{ctaLabel}</a>
      </div>
    </div>
  );
}
