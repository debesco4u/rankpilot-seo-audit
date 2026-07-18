import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Globe } from 'lucide-react';
import { User, AuditResult } from '../types';
import { apiRunAudit, apiGetUsage } from '../api';

interface AuditPageProps {
  user: User | null;
  onResult: (result: AuditResult) => void;
  onLogin: () => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({ user, onResult, onLogin }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [usage, setUsage] = useState({ used: 0, limit: 5, remaining: 5 });

  useEffect(() => {
    if (user) apiGetUsage().then(setUsage).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <Globe size={48} className="text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-base-content/60 mb-4">Please log in to run SEO audits.</p>
        <button onClick={onLogin} className="btn btn-primary text-white">Log In</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError(''); setLoading(true); setProgress('Connecting to website...');
    try {
      setProgress('Crawling pages and analyzing content...');
      const data = await apiRunAudit(url);
      setUsage({ used: data.used, limit: data.limit, remaining: data.remaining });
      onResult(data.result);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false); setProgress('');
  };

  const isLimited = user.plan === 'free' && usage.remaining <= 0;

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-base-content mb-2">Run SEO Audit</h2>
      <p className="text-base-content/60 mb-6">Enter a website URL to get a comprehensive SEO analysis.</p>

      {user.plan === 'free' && (
        <div className={`alert ${isLimited ? 'alert-error' : 'alert-info'} mb-4 py-2 text-sm`}>
          {isLimited ? (
            <><AlertCircle size={16} /> <span>Daily limit reached ({usage.used}/{usage.limit}). Upgrade for unlimited audits.</span></>
          ) : (
            <span>Free plan: {usage.remaining} of {usage.limit} audits remaining today</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="join w-full">
          <input
            type="text" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input input-bordered join-item flex-1"
            disabled={loading || isLimited}
          />
          <button type="submit" className="btn btn-primary join-item text-white" disabled={loading || isLimited || !url.trim()}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Analysing...' : 'Audit'}
          </button>
        </div>
      </form>

      {loading && progress && (
        <div className="mt-4 text-center">
          <progress className="progress progress-primary w-full" />
          <p className="text-sm text-base-content/60 mt-2">{progress}</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-4 py-2 text-sm">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}
    </div>
  );
};
