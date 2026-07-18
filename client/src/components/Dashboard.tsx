import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { AuditResult, User, Issue } from '../types';
import { ScoreCircle } from './ScoreCircle';

interface DashboardProps {
  result: AuditResult | null;
  user: User | null;
}

const sevColor = (s: string) => s === 'high' ? 'text-error' : s === 'medium' ? 'text-warning' : 'text-success';
const sevBg = (s: string) => s === 'high' ? 'bg-error/10' : s === 'medium' ? 'bg-warning/10' : 'bg-success/10';
const sevLabel = (s: string) => s === 'high' ? 'CRITICAL' : s === 'medium' ? 'WARNING' : 'MINOR';

export const Dashboard: React.FC<DashboardProps> = ({ result, user }) => {
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-base-content/60">No audit results yet.</p>
          <p className="text-sm text-base-content/40">Run an audit to see your dashboard.</p>
        </div>
      </div>
    );
  }

  const isPaid = user && (user.plan === 'diy' || user.plan === 'whitelabel');
  const highIssues = result.issues.filter(i => i.severity === 'high');
  const medIssues = result.issues.filter(i => i.severity === 'medium');
  const lowIssues = result.issues.filter(i => i.severity === 'low');

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-base-content">Audit Results</h2>
          <p className="text-sm text-base-content/60 break-url">{result.siteUrl}</p>
          <p className="text-xs text-base-content/40">{result.auditDate} &bull; {result.pages.length} pages audited</p>
        </div>
        <ScoreCircle score={result.overallScore} size={120} strokeWidth={10} label="Overall Score" />
      </div>

      {/* Issue Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { count: highIssues.length, label: 'Critical', color: 'text-error', bg: 'bg-error/10', border: 'border-error/30' },
          { count: medIssues.length, label: 'Warnings', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
          { count: lowIssues.length, label: 'Minor', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
        ].map((s, i) => (
          <div key={i} className={`card ${s.bg} border ${s.border}`}>
            <div className="card-body p-3 items-center text-center">
              <span className={`text-2xl font-bold ${s.color}`}>{s.count}</span>
              <span className={`text-xs ${s.color}`}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Scores */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-bold text-base-content mb-3">Category Scores</h3>
          <div className="space-y-3">
            {result.categoryScores.map(cat => {
              const pct = Math.round(cat.score / cat.maxScore * 100);
              const color = pct >= 80 ? 'progress-success' : pct >= 60 ? 'progress-warning' : 'progress-error';
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content">{cat.label}</span>
                    <span className="text-base-content/60">{cat.score}/{cat.maxScore} ({cat.issueCount} issues)</span>
                  </div>
                  <progress className={`progress ${color} w-full`} value={pct} max="100" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technical Checks */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-bold text-base-content mb-3">Technical SEO</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'HTTPS', pass: result.technicalChecks.isHttps },
              { label: 'robots.txt', pass: result.technicalChecks.hasRobotsTxt },
              { label: 'Sitemap', pass: result.technicalChecks.hasSitemap },
              { label: 'Indexed', pass: result.technicalChecks.googleIndexed },
            ].map(t => (
              <div key={t.label} className={`flex items-center gap-2 p-2 rounded ${t.pass ? 'bg-success/10' : 'bg-error/10'}`}>
                {t.pass ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-error" />}
                <span className="text-sm">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-bold text-base-content mb-3">All Issues ({result.issues.length})</h3>
          <div className="space-y-2">
            {result.issues.sort((a, b) => {
              const order = { high: 0, medium: 1, low: 2 };
              return (order[a.severity] || 0) - (order[b.severity] || 0);
            }).map((issue, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${sevBg(issue.severity)} border border-base-300`}>
                <div className="flex items-start gap-2">
                  <span className={`badge badge-sm ${issue.severity === 'high' ? 'badge-error' : issue.severity === 'medium' ? 'badge-warning' : 'badge-success'} text-white`}>
                    {sevLabel(issue.severity)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${sevColor(issue.severity)}`}>{issue.title}</p>
                    <p className="text-xs text-base-content/60 mt-1">{issue.description}</p>
                    {issue.page && <p className="text-xs text-base-content/40 break-url mt-1">{issue.page}</p>}
                    {isPaid && issue.recommendation && (
                      <div className="mt-2 p-2 bg-success/10 border border-success/30 rounded text-xs text-success">
                        <strong>Fix:</strong> {issue.recommendation}
                      </div>
                    )}
                    {!isPaid && (
                      <p className="text-xs text-base-content/40 italic mt-1">Upgrade for fix recommendations</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page-by-Page */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-bold text-base-content mb-3">Page Analysis ({result.pages.length} pages)</h3>
          <div className="space-y-2">
            {result.pages.map(page => {
              const pageIssues = result.issues.filter(i => i.page === page.url);
              const hasHigh = pageIssues.some(i => i.severity === 'high');
              const hasMed = pageIssues.some(i => i.severity === 'medium');
              const statusColor = hasHigh ? 'border-error/50' : hasMed ? 'border-warning/50' : 'border-success/50';
              const expanded = expandedPage === page.url;
              return (
                <div key={page.url} className={`border ${statusColor} rounded-lg overflow-hidden`}>
                  <button
                    className="w-full p-3 flex items-center justify-between hover:bg-base-300/50"
                    onClick={() => setExpandedPage(expanded ? null : page.url)}
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-sm text-base-content truncate">{page.title}</p>
                      <p className="text-xs text-base-content/40 break-url">{page.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-base-content/60">{pageIssues.length} issues</span>
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  {expanded && (
                    <div className="p-3 border-t border-base-300 bg-base-100 space-y-2">
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                        <div><span className="text-base-content/40">Words</span><br /><strong>{page.wordCount}</strong></div>
                        <div><span className="text-base-content/40">H1s</span><br /><strong>{page.h1Count}</strong></div>
                        <div><span className="text-base-content/40">H2s</span><br /><strong>{page.h2Count}</strong></div>
                        <div><span className="text-base-content/40">Images</span><br /><strong>{page.imageCount}</strong></div>
                        <div><span className="text-base-content/40">Int Links</span><br /><strong>{page.internalLinks}</strong></div>
                        <div><span className="text-base-content/40">Ext Links</span><br /><strong>{page.externalLinks}</strong></div>
                      </div>
                      {pageIssues.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {pageIssues.map((issue, i) => (
                            <div key={i} className={`text-xs p-2 rounded ${sevBg(issue.severity)}`}>
                              <span className={`font-medium ${sevColor(issue.severity)}`}>[{sevLabel(issue.severity)}]</span> {issue.title}: {issue.description}
                              {isPaid && issue.recommendation && (
                                <div className="mt-1 text-success"><strong>Fix:</strong> {issue.recommendation}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {pageIssues.length === 0 && (
                        <p className="text-xs text-success">✅ No issues found on this page!</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
