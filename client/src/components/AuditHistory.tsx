import React, { useState, useEffect } from 'react';

interface AuditRecord {
  id: number;
  url: string;
  score: number;
  created_at: string;
  results: string;
}

interface Props {
  token: string;
}

export const AuditHistory: React.FC<Props> = ({ token }) => {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/audit/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setAudits(data.audits || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center py-8">Loading history...</div>;
  if (audits.length === 0) return <div className="text-center py-8 text-gray-500">No audits yet. Run your first audit!</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-4">Audit History</h2>
      {audits.map(a => (
        <div key={a.id} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${a.score >= 80 ? 'bg-green-500' : a.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                {a.score}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ wordBreak: 'break-all' }}>{a.url}</p>
                <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
            <span className="text-gray-400">{expanded === a.id ? '▲' : '▼'}</span>
          </div>
          {expanded === a.id && (
            <div className="mt-3 pt-3 border-t text-sm">
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded max-h-60 overflow-auto">
                {JSON.stringify(JSON.parse(a.results || '{}'), null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
