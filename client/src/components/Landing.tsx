import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PricingCards from './PricingCards';
import ScoreCircle from './ScoreCircle';
import type { Tier, User } from '../types';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onSelectTier: (tier: Tier) => void;
}

export default function Landing({ user, onLoginClick, onSelectTier }: Props) {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleAudit = () => {
    if (!user) { onLoginClick(); return; }
    navigate('/dashboard', { state: { url } });
  };

  const tabs = ['Overview', 'Page Analysis', 'Keywords', 'Action Plan', 'PDF Report'];
  const tabContent = [
    { title: 'Overall Score & Summary', desc: 'Get a comprehensive SEO health score with color-coded categories showing exactly where your site stands.' },
    { title: 'Page-by-Page Breakdown', desc: 'Every page audited individually with specific issues, fix recommendations, and priority levels.' },
    { title: 'Keyword Strategy', desc: 'Discover high-value keywords your competitors rank for, with difficulty scores and target page recommendations.' },
    { title: '90-Day Action Plan', desc: 'A week-by-week roadmap of exactly what to fix, prioritized by impact. Never wonder what to do next.' },
    { title: 'Professional PDF Reports', desc: 'Download beautifully formatted, client-ready PDF reports. White Label plan removes all RankPilot branding.' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: '#fff', padding: '80px 32px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
          Your Website Deserves<br/>Better Rankings
        </h1>
        <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 600, margin: '0 auto 40px' }}>
          Get a comprehensive SEO audit with actionable fixes. Crawl every page, find every issue, boost your traffic.
        </p>
        <div style={{ display: 'flex', gap: 12, maxWidth: 500, margin: '0 auto' }}>
          <input
            value={url} onChange={e => setUrl(e.target.value)}
            placeholder="Enter your website URL..."
            style={{
              flex: 1, padding: '16px 20px', borderRadius: 12, border: 'none',
              fontSize: 16, outline: 'none'
            }}
          />
          <button onClick={handleAudit} style={{
            padding: '16px 32px', borderRadius: 12, border: 'none',
            background: '#f59e0b', color: '#1e3a8a', fontWeight: 700,
            fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>Audit Now 🚀</button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          What You Get
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 40 }}>
          A complete SEO toolkit in one audit
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '🔍', title: 'Full Site Crawl', desc: 'Every page analyzed, not just the homepage' },
            { icon: '📊', title: 'Detailed Scoring', desc: 'Color-coded scores across 8 SEO categories' },
            { icon: '🔧', title: 'Fix Recommendations', desc: 'Exact steps to fix each issue found' },
            { icon: '📈', title: 'Keyword Research', desc: 'High-value keyword opportunities identified' },
            { icon: '📋', title: '90-Day Plan', desc: 'Week-by-week action items prioritized by impact' },
            { icon: '📄', title: 'PDF Reports', desc: 'Professional client-ready report downloads' },
          ].map(f => (
            <div key={f.title} style={{
              width: 280, padding: 24, borderRadius: 12,
              border: '1px solid #e5e7eb', textAlign: 'center'
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{f.title}</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Report Preview Tabs */}
      <section style={{ padding: '60px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
            See What Your Report Looks Like
          </h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} style={{
                padding: '10px 20px', borderRadius: 8,
                border: activeTab === i ? '2px solid #1e3a8a' : '1px solid #d1d5db',
                background: activeTab === i ? '#1e3a8a' : '#fff',
                color: activeTab === i ? '#fff' : '#374151',
                fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}>{t}</button>
            ))}
          </div>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 40,
            border: '1px solid #e5e7eb', textAlign: 'center', minHeight: 200
          }}>
            <ScoreCircle score={88} size={100} />
            <h3 style={{ marginTop: 20, fontSize: 22 }}>{tabContent[activeTab].title}</h3>
            <p style={{ color: '#6b7280', maxWidth: 500, margin: '12px auto 0' }}>
              {tabContent[activeTab].desc}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '60px 32px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Simple, Transparent Pricing
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 32 }}>
          Start free. Upgrade when you need more power.
        </p>
        <PricingCards currentTier={user?.tier} onSelect={onSelectTier} />
      </section>
    </div>
  );
}
