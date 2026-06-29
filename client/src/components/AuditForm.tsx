import React, { useState } from 'react';
import type { User, SiteAudit } from '../types';

interface Props {
  user: User;
  initialUrl?: string;
  onResult: (audit: SiteAudit) => void;
}

export default function AuditForm({ user, initialUrl, onResult }: Props) {
  const [url, setUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setStatus('Starting audit...');
    try {
      const token = localStorage.getItem('rp_token');
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url: url.trim() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Audit failed');
      }
      // Stream progress via event source or poll - for now simple await
      setStatus('Crawling pages...');
      const data = await res.json();
      setStatus('');
      onResult(data);
    } catch (err: any) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const remaining = user.tier === 'free' ? '5 audits/day' : 'Unlimited';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <form onSubmit={handleAudit} style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 12 }}>
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            flex: '1 1 250px', padding: '14px 18px', borderRadius: 10, minWidth: 0, boxSizing: 'border-box' as const, border: '1px solid #d1d5db',
            fontSize: 16, outline: 'none'
          }}
        />
        <button type="submit" disabled={loading} style={{
          padding: '14px 28px', borderRadius: 10, border: 'none',
          background: loading ? '#9ca3af' : '#16a34a', color: '#fff',
          fontWeight: 600, fontSize: 15, cursor: loading ? 'default' : 'pointer'
        }}>{loading ? '⏳ Auditing...' : '🔍 Audit'}</button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: '#6b7280' }}>
        <span>Plan: {user.tier.toUpperCase()}</span>
        <span>{remaining}</span>
      </div>
      {status && <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8, color: '#15803d', fontSize: 14 }}>⏳ {status}</div>}
      {error && <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>❌ {error}</div>}
    </div>
  );
}
