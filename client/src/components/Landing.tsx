import React from 'react';
import { Search, Shield, Zap, FileText, BarChart3, Globe, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { SUPPORT_EMAIL } from '../types';

interface LandingProps {
  onAnalyse: () => void;
  onSignup: () => void;
}

const samplePages = [
  { url: '/home', title: 'Homepage', score: 82, issues: 3, status: 'good' as const },
  { url: '/about', title: 'About Us', score: 65, issues: 7, status: 'warning' as const },
  { url: '/services', title: 'Services', score: 91, issues: 1, status: 'good' as const },
  { url: '/contact', title: 'Contact', score: 45, issues: 12, status: 'poor' as const },
  { url: '/blog', title: 'Blog', score: 78, issues: 4, status: 'good' as const },
];

const sampleIssues = [
  { severity: 'high' as const, title: 'Missing H1 Tag', page: '/contact', fix: 'Add a descriptive H1 heading with your primary keyword.' },
  { severity: 'high' as const, title: 'No Meta Description', page: '/about', fix: 'Write a compelling 150-160 character meta description.' },
  { severity: 'medium' as const, title: 'Images Missing Alt Text', page: '/home', fix: 'Add descriptive alt attributes to all images.' },
  { severity: 'low' as const, title: 'Title Too Long (72 chars)', page: '/blog', fix: 'Shorten page title to under 60 characters.' },
];

const ScoreMini: React.FC<{ score: number; size?: number }> = ({ score, size = 64 }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  const color = pct >= 0.8 ? '#16a34a' : pct >= 0.6 ? '#eab308' : '#dc2626';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  );
};

export const Landing: React.FC<LandingProps> = ({ onAnalyse, onSignup }) => (
  <div>
    {/* Hero */}
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
          Boost Your Website&apos;s SEO with AI-Powered Audits
        </h1>
        <p className="text-lg md:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
          Get a comprehensive SEO analysis of your entire website. Discover issues, get fix recommendations, and boost your search rankings.
        </p>
        <button onClick={onAnalyse} className="btn btn-primary btn-lg text-white gap-2">
          <Search size={20} /> Analyse Now
        </button>
      </div>
    </section>

    {/* ═══ SAMPLE SNEAK PEEK ═══ */}
    <section className="bg-white py-16 border-t border-base-200">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-base-content">
          See What You&apos;ll Get
        </h2>
        <p className="text-center text-base-content/60 mb-10">
          Here&apos;s a sneak peek of a real SEO audit report
        </p>

        {/* Overall Score Card */}
        <div className="card bg-base-100 shadow-lg border border-base-200 mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-col items-center">
                <ScoreMini score={72} size={100} />
                <span className="text-xs text-base-content/60 mt-1">Overall Score</span>
                <span className="badge badge-warning badge-sm mt-1">Grade: B</span>
              </div>
              <div className="flex-1 w-full">
                <h3 className="font-bold text-lg mb-3 text-base-content">example-website.com</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: 'Pages Crawled', value: '12', icon: '📄' },
                    { label: 'Issues Found', value: '27', icon: '⚠️' },
                    { label: 'Critical', value: '5', icon: '🔴' },
                    { label: 'Opportunities', value: '15', icon: '💡' },
                  ].map((s, i) => (
                    <div key={i} className="bg-base-200/50 rounded-lg p-3">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-xl font-bold text-base-content">{s.value}</div>
                      <div className="text-xs text-base-content/60">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Bars */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { label: 'Technical', score: 20, max: 25 },
                { label: 'On-Page', score: 18, max: 25 },
                { label: 'Content', score: 15, max: 25 },
                { label: 'Images', score: 10, max: 15 },
                { label: 'Links', score: 9, max: 10 },
              ].map((c, i) => {
                const pct = c.score / c.max;
                const color = pct >= 0.8 ? 'bg-success' : pct >= 0.6 ? 'bg-warning' : 'bg-error';
                return (
                  <div key={i} className="bg-base-200/50 rounded-lg p-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-base-content">{c.label}</span>
                      <span className="text-base-content/70">{c.score}/{c.max}</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2">
                      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Page-by-Page Preview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pages Table */}
          <div className="card bg-base-100 shadow border border-base-200">
            <div className="card-body p-4">
              <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
                <Globe size={18} className="text-primary" /> Page-by-Page Analysis
              </h4>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th className="text-center">Score</th>
                      <th className="text-center">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samplePages.map((p, i) => (
                      <tr key={i} className="hover">
                        <td>
                          <div className="font-medium text-sm text-base-content">{p.title}</div>
                          <div className="text-xs text-base-content/50">{p.url}</div>
                        </td>
                        <td className="text-center">
                          <span className={`badge badge-sm ${
                            p.status === 'good' ? 'badge-success' : p.status === 'warning' ? 'badge-warning' : 'badge-error'
                          } text-white`}>{p.score}</span>
                        </td>
                        <td className="text-center text-sm">{p.issues}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Issues with Fix Boxes */}
          <div className="card bg-base-100 shadow border border-base-200">
            <div className="card-body p-4">
              <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-warning" /> Issues & Fix Recommendations
              </h4>
              <div className="space-y-3">
                {sampleIssues.map((issue, i) => (
                  <div key={i} className={`rounded-lg border-l-4 p-3 bg-base-200/30 ${
                    issue.severity === 'high' ? 'border-error' : issue.severity === 'medium' ? 'border-warning' : 'border-info'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {issue.severity === 'high' ? <XCircle size={14} className="text-error" /> :
                       issue.severity === 'medium' ? <AlertTriangle size={14} className="text-warning" /> :
                       <CheckCircle size={14} className="text-info" />}
                      <span className="font-medium text-sm text-base-content">{issue.title}</span>
                      <span className="text-xs text-base-content/50 ml-auto">{issue.page}</span>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded p-2 mt-1">
                      <span className="text-xs font-bold text-success">Fix: </span>
                      <span className="text-xs text-base-content/70">{issue.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 90-Day Action Plan Preview */}
        <div className="card bg-base-100 shadow border border-base-200 mb-8">
          <div className="card-body p-4">
            <h4 className="font-bold text-base-content mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" /> 90-Day Action Plan
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { phase: 'Days 1–30', title: 'Quick Wins', color: 'border-success', items: ['Fix all missing H1 tags', 'Add meta descriptions', 'Fix broken images'] },
                { phase: 'Days 31–60', title: 'Foundation', color: 'border-warning', items: ['Create XML sitemap', 'Improve internal linking', 'Optimize page speed'] },
                { phase: 'Days 61–90', title: 'Growth', color: 'border-primary', items: ['Build quality backlinks', 'Create content strategy', 'Monitor rankings'] },
              ].map((p, i) => (
                <div key={i} className={`border-t-4 ${p.color} rounded-lg bg-base-200/30 p-4`}>
                  <div className="text-xs font-bold text-primary mb-1">{p.phase}</div>
                  <div className="font-bold text-sm text-base-content mb-2">{p.title}</div>
                  <ul className="space-y-1">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-base-content/70">
                        <CheckCircle size={12} className="text-success mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blurred overlay CTA */}
        <div className="text-center">
          <p className="text-base-content/60 text-sm mb-4">
            This is just a preview — your full report includes keyword analysis, detailed page cards, and more!
          </p>
          <button onClick={onAnalyse} className="btn btn-primary text-white gap-2">
            Run Your Free Audit Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="bg-base-200 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-base-content">
          Everything You Need for Better Rankings
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: 'Full Site Crawl', desc: 'Audits ALL pages — not just the homepage. Discover hidden issues across your entire site.' },
            { icon: Shield, title: 'Technical SEO', desc: 'Check HTTPS, robots.txt, sitemaps, and more. Fix critical technical issues holding you back.' },
            { icon: Zap, title: 'AI-Powered Analysis', desc: 'Smart scoring and prioritized recommendations so you know exactly what to fix first.' },
            { icon: FileText, title: 'Detailed Reports', desc: 'Color-coded reports with page-by-page analysis, keyword density, and fix recommendations.' },
            { icon: BarChart3, title: 'Score Tracking', desc: 'Track your SEO score over time. See how your fixes improve your rankings.' },
            { icon: Search, title: '90-Day Action Plan', desc: 'Get a structured roadmap with quick wins, foundation building, and growth strategies.' },
          ].map((f, i) => (
            <div key={i} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body items-center text-center">
                <f.icon size={32} className="text-primary mb-2" />
                <h3 className="card-title text-base-content">{f.title}</h3>
                <p className="text-sm text-base-content/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Improve Your SEO?
        </h2>
        <p className="text-white/80 mb-8">
          Sign up free and get 5 audits per day. No credit card required.
        </p>
        <button onClick={onSignup} className="btn btn-lg bg-white text-primary hover:bg-base-200 border-0">
          Get Started Free
        </button>
        <p className="text-white/60 text-sm mt-4">
          Need help? <a href={`mailto:${SUPPORT_EMAIL}`} className="underline text-white">{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </section>
  </div>
);
