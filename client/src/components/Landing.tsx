import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PricingCards from './PricingCards';
import type { User, Tier } from '../types';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onSelectTier: (tier: Tier) => void;
}

const samplePages = [
  { src: '/samples/sample_2.jpg', caption: 'Executive Summary' },
  { src: '/samples/sample_4.jpg', caption: 'Page-by-Page Analysis' },
  { src: '/samples/sample_6.jpg', caption: 'Issue Breakdown' },
  { src: '/samples/sample_14.jpg', caption: 'Keyword Strategy' },
  { src: '/samples/sample_16.jpg', caption: '90-Day Action Plan' },
];

export default function Landing({ user, onLoginClick, onSelectTier }: Props) {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [previewIdx, setPreviewIdx] = useState(0);

  const handleGo = () => {
    if (!url.trim()) return;
    if (!user) { onLoginClick(); return; }
    navigate('/dashboard', { state: { url: url.trim() } });
  };

  return (
    <div style={{ background: '#fafafa', overflowX: 'hidden' as const }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #22c55e 100%)',
        color: '#fff', padding: '80px 16px 60px', textAlign: 'center', overflowX: 'hidden' as const, boxSizing: 'border-box' as const
      }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>
          Boost Your Website's SEO with AI-Powered Audits
        </h1>
        <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 600, margin: '0 auto 36px' }}>
          Comprehensive multi-page SEO analysis with actionable fix recommendations, keyword strategy & 90-day action plans.
        </p>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 520, margin: '0 auto',
          background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 8,
          boxSizing: 'border-box' as const, width: '100%'
        }}>
          <input
            value={url} onChange={e => setUrl(e.target.value)}
            placeholder="Enter your website URL..."
            onKeyDown={e => e.key === 'Enter' && handleGo()}
            style={{
              flex: '1 1 250px', padding: '14px 18px', borderRadius: 10, border: 'none',
              fontSize: 16, outline: 'none', background: '#fff', color: '#111',
              minWidth: 0, boxSizing: 'border-box' as const
            }}
          />
          <button onClick={handleGo} style={{
            flex: '0 0 auto', padding: '14px 28px', borderRadius: 10, border: 'none',
            background: '#fff', color: '#16a34a', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', whiteSpace: 'nowrap', width: 'auto',
            boxSizing: 'border-box' as const
          }}>Audit Now →</button>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 40, color: '#111' }}>
          What You Get
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: '🌐', title: 'Full-Site Crawl', desc: 'Every page analyzed — not just your homepage. We crawl your entire site to find hidden issues.' },
            { icon: '🎯', title: 'Color-Coded Issues', desc: 'Critical, Warning, and Good ratings with clear visual indicators so you know exactly what to fix first.' },
            { icon: '🔧', title: 'Fix Recommendations', desc: 'Each issue comes with a specific "Fix:" box telling you exactly what to do. No guessing required.' },
            { icon: '📊', title: 'Keyword Strategy', desc: 'Discover which keywords to target and how to optimize your content to rank higher in search results.' },
            { icon: '📋', title: '90-Day Action Plan', desc: 'A structured roadmap breaking your SEO improvement into monthly milestones for steady progress.' },
            { icon: '📄', title: 'Pro PDF Report', desc: 'Download a beautifully designed PDF report you can share with your team or clients.' },
          ].map((f, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 28,
              border: '1px solid #e5e7eb', textAlign: 'center'
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#111' }}>{f.title}</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Report Preview */}
      <section style={{ background: '#14532d', padding: '60px 24px', color: '#fff' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          See What's Inside Your Pro Report
        </h2>
        <p style={{ textAlign: 'center', opacity: 0.8, maxWidth: 500, margin: '0 auto 40px', fontSize: 16 }}>
          Real pages from an actual SEO audit report — this is what you'll receive.
        </p>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Main preview */}
          <div style={{
            background: '#fff', borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: 24
          }}>
            <img
              src={samplePages[previewIdx].src}
              alt={samplePages[previewIdx].caption}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
            {samplePages[previewIdx].caption}
          </p>
          {/* Thumbnails */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {samplePages.map((sp, i) => (
              <div key={i} onClick={() => setPreviewIdx(i)} style={{
                cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                border: i === previewIdx ? '3px solid #22c55e' : '3px solid transparent',
                opacity: i === previewIdx ? 1 : 0.6, transition: 'all 0.2s',
                width: 120
              }}>
                <img src={sp.src} alt={sp.caption} style={{ width: '100%', display: 'block' }}/>
                <div style={{
                  background: i === previewIdx ? '#22c55e' : 'rgba(255,255,255,0.1)',
                  color: i === previewIdx ? '#fff' : '#ccc',
                  fontSize: 10, fontWeight: 600, textAlign: 'center', padding: '4px 2px'
                }}>{sp.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 40, color: '#111' }}>
          How It Works
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            { step: '1', title: 'Enter Your URL', desc: 'Paste any website URL and we\'ll automatically discover and crawl every page.' },
            { step: '2', title: 'Get Your Analysis', desc: 'Our engine checks 50+ SEO factors across every page with color-coded severity ratings.' },
            { step: '3', title: 'Follow the Fixes', desc: 'Each issue includes a specific fix recommendation. Follow them to boost your rankings.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: '#16a34a',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 20, flexShrink: 0
              }}>{s.step}</div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18, color: '#111' }}>{s.title}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 15, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ background: '#f0fdf4', padding: '60px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#111' }}>
          Choose Your Plan
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', maxWidth: 500, margin: '0 auto 40px' }}>
          Start free. Upgrade anytime for deeper insights and professional reports.
        </p>
        <PricingCards currentTier={user?.tier} onSelect={onSelectTier} />
      </section>
    </div>
  );
}
