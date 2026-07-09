import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Tier } from '../types';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onSelectTier: (tier: Tier) => void;
  showLoginPrompt?: boolean;
}

export default function Landing({ user, onLoginClick, onSelectTier, showLoginPrompt }: Props) {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  // Auto-show login when redirected from /audit without auth
  React.useEffect(() => {
    if (showLoginPrompt && !user) onLoginClick();
  }, [showLoginPrompt]);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!user) { onLoginClick(); return; }
    const encoded = encodeURIComponent(url.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''));
    navigate(`/audit?url=${encoded}`);
  };

  const plans = [
    { name: 'Free', price: '$0', period: '/forever', tier: 'free', features: ['General SEO audit', '5 searches/day', 'Basic score overview', 'Limited recommendations'], cta: 'Start Free', highlight: false },
    { name: 'DIY SEO', price: '$15', period: '/month', tier: 'diy', features: ['Full site crawl audit', 'Unlimited searches', 'Advanced fix recommendations', 'Keyword strategy', '90-day action plan', 'Audit history'], cta: 'Get Started', highlight: true },
    { name: 'White Label', price: '$20', period: '/month', tier: 'whitelabel', features: ['Everything in DIY SEO', 'Detailed PDF reports', 'Remove all branding', 'Custom report headers', 'Client-ready exports', 'Priority support'], cta: 'Go Pro', highlight: false },
  ];

  const section: React.CSSProperties = { padding: '80px 24px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ ...section, paddingTop: 100, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#16a34a', marginBottom: 16, lineHeight: 1.2 }}>
          Boost Your Website's SEO with AI-Powered Audits
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#4b5563', maxWidth: 650, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Get actionable insights to improve your search rankings. Analyze any website in seconds with our comprehensive SEO audit tool.
        </p>
        <form onSubmit={handleAudit} style={{ display: 'flex', gap: 12, maxWidth: 550, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="Enter website URL (e.g. example.com)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: '14px 18px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = '#16a34a')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
          <button type="submit" style={{ padding: '14px 32px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Analyze Now
          </button>
        </form>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 14 }}>No signup required for basic audits · Free forever</p>
      </section>

      {/* Features */}
      <section style={{ background: '#f9fafb', padding: '60px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#111', marginBottom: 40 }}>Why Choose Our SEO Tool?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { icon: '🔍', title: 'Deep Site Analysis', desc: 'Crawl every page — not just the homepage. Find hidden issues affecting your rankings.' },
              { icon: '⚡', title: 'Instant Results', desc: 'Get a comprehensive audit in seconds with actionable fix recommendations.' },
              { icon: '📊', title: 'Detailed Reports', desc: 'Color-coded PDF reports with scores, keyword strategy, and a 90-day action plan.' },
              { icon: '🎯', title: 'Keyword Strategy', desc: 'Discover high-impact keywords and learn exactly where to target them.' },
              { icon: '📱', title: 'Mobile Analysis', desc: 'Check mobile-friendliness, viewport settings, and responsive design issues.' },
              { icon: '🔒', title: 'Security Check', desc: 'Verify SSL certificates, check for mixed content, and assess site security.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e5e7eb', textAlign: 'left' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ ...section, paddingBottom: 80 }}>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#111', marginBottom: 12 }}>Simple, Transparent Pricing</h2>
        <p style={{ color: '#6b7280', marginBottom: 40, fontSize: 16 }}>Choose the plan that fits your needs. Upgrade or downgrade anytime.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }}>
          {plans.map((p, i) => (
            <div key={i} style={{
              background: p.highlight ? '#16a34a' : '#fff',
              color: p.highlight ? '#fff' : '#111',
              borderRadius: 16,
              padding: 32,
              border: p.highlight ? 'none' : '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: p.highlight ? '0 8px 32px rgba(22,163,74,0.2)' : 'none',
            }}>
              {p.highlight && (
                <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#fbbf24', color: '#111', fontSize: 12, fontWeight: 700, padding: '4px 16px', borderRadius: 20 }}>MOST POPULAR</span>
              )}
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>{p.price}</span>
                <span style={{ fontSize: 16, opacity: 0.8 }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left', flex: 1 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ padding: '6px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: p.highlight ? '#bbf7d0' : '#16a34a', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (p.tier === 'free') { navigate('/audit'); return; }
                  if (!user) { onLoginClick(); return; }
                  onSelectTier(p.tier as Tier);
                }}
                style={{
                  padding: '12px 24px',
                  background: p.highlight ? '#fff' : '#16a34a',
                  color: p.highlight ? '#16a34a' : '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
