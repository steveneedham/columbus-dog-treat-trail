import React from 'react';

export function Brand({ subtitle, logoSrc = 'assets/logo-lockup.svg' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={logoSrc} alt="Columbus Dog Treat Trail" style={{ height: 38, width: 'auto', display: 'block' }} />
      {subtitle ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-label)', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>{subtitle}</div>
      ) : null}
    </div>
  );
}
