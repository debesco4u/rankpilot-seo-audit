import React, { useState, useEffect } from 'react';
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
  const [remaining, setRemaining] = useState<number | null>(null);
  const [tier, setTier] = useState(user.tier);

  // Fetch remaining audits on mount
  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    if (!token) return;
    fetch('/api/audit/remaining', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setRemaining(data.remaining);
          setTier(data.tier);
        }
      })
      .catch(() => {});
  }, []);

  const isExhausted = tier === 'free' && remaining !== null && remaining <= 0;

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isExhausted) return;
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
      setStatus('Crawling pages...');
      const data = await res.json();
      setStatus('');
      // Update remaining from response
      if (data.remaining !== undefined && data.remaining !== null) {
        setRemaining(data.remaining);
      } else if (tier === 'free' && remaining !== null) {
        setRemaining(Math.max(0, remaining - 1));
      }
      onResult(data);
    } catch (err: any) {
      setError(err.message);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const remainingText = tier === 'free'
    ? (remaining !== null ? `${remaining} of 5 audits remaining today` : '5 audits/day')
    : '✨ Unlimited audits';

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <form onSubmit={handleAudit} style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 12 }}>
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={isExhausted}
          style={{
            flex: '1 1 250px', padding: '14px 18px', borderRadius: 10, minWidth: 0, boxSizing: 'border-box' as const, border: '1px solid #d1d5db',
            fontSize: 16, outline: 'none', opacity: isExhausted ? 0.5 : 1
          }}
        />
        <button type="submit" disabled={loading || isExhausted} style={{
          padding: '14px 28px', borderRadius: 10, border: 'none',
          background: isExhausted ? '#dc2626' : loading ? '#9ca3af' : '#16a34a', color: '#fff',
          fontWeight: 600, fontSize: 15, cursor: loading || isExhausted ? 'default' : 'pointer'
        }}>{isExhausted ? '🚫 Limit Reached' : loading ? '⏳ Auditing...' : '🔍 Audit'}</button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: '#6b7280' }}>
        <span>Plan: {tier.toUpperCase()}</span>
        <span style={{ color: isExhausted ? '#dc2626' : remaining !== null && remaining <= 2 ? '#f59e0b' : '#6b7280', fontWeight: isExhausted ? 600 : 400 }}>{remainingText}</span>
      </div>
      {isExhausted && (
        <div style={{ marginTop: 16, padding: 16, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', color: '#dc2626', fontWeight: 600 }}>Daily limit reached!</p>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>You've used all 5 free audits today. Upgrade for unlimited audits.</p>
        </div>
      )}
      {status && <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8, color: '#15803d', fontSize: 14 }}>⏳ {status}</div>}
      {error && <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>❌ {error}</div>}
    </div>
  );
}
