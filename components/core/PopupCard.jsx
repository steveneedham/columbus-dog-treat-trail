import React from 'react';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';

export function PopupCard({ name, typeLabel, neighborhood, status = 'unverified', seasonal = false, venue, notes, photoUrl, onDirections, onMarkVerified }) {
  return (
    <div style={{
      width: 230,
      background: 'var(--white)',
      border: 'var(--border-default) solid var(--ink)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
      padding: '14px 16px',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-display-sm)', margin: '0 0 4px', color: 'var(--ink)' }}>{name}</div>
      {photoUrl ? <img src={photoUrl} alt={name} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 3, border: '1px solid var(--line)', marginBottom: 8, display: 'block' }} /> : null}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-meta)', color: 'var(--ink-soft)', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>{typeLabel} · {neighborhood}</span>
        <Badge status={status} />
        {seasonal ? <Badge status="seasonal" /> : null}
      </div>
      {venue ? <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 6, fontStyle: 'italic' }}>{venue}</div> : null}
      <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--ink)', marginBottom: 10, lineHeight: 'var(--leading-normal)' }}>{notes}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name)}&travelmode=walking`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-meta)', fontWeight: 700, padding: '5px 8px', borderRadius: 2, border: '1px solid var(--ink)', cursor: 'pointer', background: 'var(--paper)', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none' }}>Google Maps</a>
        <a href={`https://maps.apple.com/?q=${encodeURIComponent(name)}&dirflg=w`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-meta)', fontWeight: 700, padding: '5px 8px', borderRadius: 2, border: '1px solid var(--ink)', cursor: 'pointer', background: 'var(--paper)', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none' }}>Apple Maps</a>
        {status !== 'verified' ? (
          <button onClick={onMarkVerified} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-meta)', fontWeight: 700, padding: '5px 8px', borderRadius: 2, border: '1px solid var(--moss)', cursor: 'pointer', background: 'var(--moss)', color: 'var(--white)', textTransform: 'uppercase' }}>Mark verified</button>
        ) : null}
      </div>
    </div>
  );
}
