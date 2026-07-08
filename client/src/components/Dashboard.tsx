import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import AuditForm from './AuditForm';
import AuditHistory from './AuditHistory';
import ScoreCircle from './ScoreCircle';
import type { User, SiteAudit, Tier } from '../types';

interface Props {
  user: User | null;
}

export default function Dashboard({ user }: Props) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || (location.state as any)?.url || '';
  const [audit, setAudit] = useState<SiteAudit | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [view, setView] = useState<'form' | 'result'>('form');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('rp_token');
      const res = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {}
  };

  const handleResult = (data: SiteAudit) => {
    setAudit(data);
    setView('result');
    loadHistory();
  };

  const handleSelectAudit = async (id: string) => {
    try {
      const token = localStorage.getItem('rp_token');
      const res = await fetch(`/api/history/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data);
        setView('result');
      }
    } catch {}
  };

  const handleDownloadPdf = () => {
    if (!audit) return;
    const token = localStorage.getItem('rp_token');
    window.open(`/api/pdf/${encodeURIComponent(audit.domain)}?token=${token}`, '_blank');
  };

  const scoreColor = (s: number) => s >= 80 ? '#22c55e' : s >= 50 ? '#eab308' : '#ef4444';
  const isPaid = user ? user.tier !== 'free' : false;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            Welcome back, {user?.name || 'Guest'} · <span style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
              background: !user || user.tier === 'free' ? '#f3f4f6' : user.tier === 'diy' ? '#dcfce7' : '#ede9fe',
              color: !user || user.tier === 'free' ? '#6b7280' : user.tier === 'diy' ? '#15803d' : '#6d28d9'
            }}>{(user?.tier || 'free').toUpperCase()}</span>
          </p>
        </div>
        {view === 'result' && (
          <button onClick={() => { setView('form'); setAudit(null); }} style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db',
            background: '#fff', cursor: 'pointer', fontWeight: 500
          }}>← New Audit</button>
        )}
      </div>

      {view === 'form' ? (
        <>
          <AuditForm user={user} initialUrl={initialUrl} onResult={handleResult} />
          <div style={{ marginTop: 40 }}>
            <AuditHistory audits={history} onSelect={handleSelectAudit} />
          </div>
        </>
      ) : audit ? (
        <div>
          {/* Overall Score */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 32, padding: 32,
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', marginBottom: 24
          }}>
            <ScoreCircle score={audit.overallScore} size={140} label="Overall SEO Score" />
            <div>
              <h2 style={{ margin: '0 0 8px', wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const }}>{audit.domain}</h2>
              <p style={{ margin: 0, color: '#6b7280' }}>{audit.pages.length} pages crawled · {new Date(audit.timestamp).toLocaleString()}</p>
              {isPaid && (
                <button onClick={handleDownloadPdf} style={{
                  marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer'
                }}>📄 Download PDF Report</button>
              )}
            </div>
          </div>

          {/* Page Cards */}
          <h3>Page-by-Page Results</h3>
          {audit.pages.map((page, i) => (
            <div key={i} style={{
              border: '1px solid #e5e7eb', borderRadius: 12, padding: 20,
              marginBottom: 16, background: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, wordBreak: 'break-word' as const, overflowWrap: 'anywhere' as const }}>{page.title || page.url}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const }}>{page.url}</div>
                </div>
                <div style={{
                  fontSize: 24, fontWeight: 800,
                  color: scoreColor(page.score)
                }}>{page.score}</div>
              </div>

              {/* Issues */}
              {page.issues.slice(0, isPaid ? undefined : 3).map((issue, j) => (
                <div key={j} style={{
                  padding: '8px 12px', marginBottom: 6, borderRadius: 6,
                  background: issue.type === 'critical' ? '#fef2f2' : issue.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                  borderLeft: `3px solid ${issue.type === 'critical' ? '#ef4444' : issue.type === 'warning' ? '#eab308' : '#22c55e'}`,
                  fontSize: 13
                }}>
                  <div>{issue.message}</div>
                  {isPaid && issue.fix && (
                    <div style={{ marginTop: 4, color: '#15803d', fontWeight: 500 }}>
                      Fix: {issue.fix}
                    </div>
                  )}
                </div>
              ))}
              {!isPaid && page.issues.length > 3 && (
                <div style={{ textAlign: 'center', padding: 8, color: '#6b7280', fontSize: 13 }}>
                  🔒 {page.issues.length - 3} more issues — upgrade to see all
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
