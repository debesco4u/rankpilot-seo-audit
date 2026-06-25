import React from 'react';
import ScoreCircle from './ScoreCircle';

interface AuditSummary {
  id: string;
  domain: string;
  score: number;
  pages: number;
  timestamp: string;
}

interface Props {
  audits: AuditSummary[];
  onSelect: (id: string) => void;
}

export default function AuditHistory({ audits, onSelect }: Props) {
  if (!audits.length) return (
    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
      <p style={{ fontSize: 48 }}>📋</p>
      <p>No audits yet. Run your first audit above!</p>
    </div>
  );

  return (
    <div>
      <h3 style={{ margin: '0 0 16px' }}>Audit History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {audits.map(a => (
          <div key={a.id} onClick={() => onSelect(a.id)} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 16,
            border: '1px solid #e5e7eb', borderRadius: 12, cursor: 'pointer',
            background: '#fff', transition: 'box-shadow 0.2s'
          }}>
            <ScoreCircle score={a.score} size={50} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{a.domain}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{a.pages} pages · {new Date(a.timestamp).toLocaleDateString()}</div>
            </div>
            <div style={{ color: '#9ca3af', fontSize: 20 }}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
