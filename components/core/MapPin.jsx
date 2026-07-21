import React from 'react';

export function MapPin({ color = 'var(--rust)', status = 'unverified', seasonal = false, sponsored = false, size = 22 }) {
  const ring = status === 'verified' ? 'var(--status-verified)' : 'var(--status-unverified)';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        border: `3px ${seasonal ? 'dashed' : 'solid'} ${ring}`,
        boxShadow: '1px 1px 0 rgba(43,42,38,0.3)',
        outline: sponsored ? '2px solid var(--amber)' : 'none',
        outlineOffset: sponsored ? 2 : 0
      }} />
      {sponsored ? (
        <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 10, lineHeight: 1, background: 'var(--amber)', color: 'var(--white)', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--ink)' }}>★</span>
      ) : null}
    </div>
  );
}
