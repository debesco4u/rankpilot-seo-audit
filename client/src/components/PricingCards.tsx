import React from 'react';
import type { Tier } from '../types';

interface Props {
  currentTier?: Tier;
  onSelect: (tier: Tier) => void;
}

const plans = [
  { tier: 'free' as Tier, name: 'Free', price: '$0', period: '/forever',
    features: ['General SEO audit', '5 searches/day', 'Basic score overview', 'Top 3 issues shown'],
    color: '#6b7280' },
  { tier: 'diy' as Tier, name: 'DIY SEO', price: '$15', period: '/month',
    features: ['Full page-by-page audit', 'Keyword strategy', '90-day action plan', 'Unlimited searches', 'Audit history'],
    color: '#3b82f6', popular: true },
  { tier: 'whitelabel' as Tier, name: 'White Label', price: '$20', period: '/month',
    features: ['Everything in DIY SEO', 'Detailed PDF download', 'Remove RankPilot branding', 'Client-ready reports', 'Priority support'],
    color: '#8b5cf6' },
];

export default function PricingCards({ currentTier, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '20px 0' }}>
      {plans.map(p => (
        <div key={p.tier} style={{
          border: p.popular ? `2px solid ${p.color}` : '1px solid #e5e7eb',
          borderRadius: 16, padding: 32, width: 280, position: 'relative',
          background: currentTier === p.tier ? '#f0f9ff' : '#fff',
          boxShadow: p.popular ? '0 8px 30px rgba(59,130,246,0.15)' : '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          {p.popular && <div style={{
            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
            background: p.color, color: '#fff', padding: '4px 16px', borderRadius: 20,
            fontSize: 12, fontWeight: 600
          }}>MOST POPULAR</div>}
          <h3 style={{ margin: 0, color: p.color, fontSize: 20 }}>{p.name}</h3>
          <div style={{ margin: '16px 0' }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>{p.price}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>{p.period}</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0' }}>
            {p.features.map(f => (
              <li key={f} style={{ padding: '6px 0', fontSize: 14, color: '#374151' }}>✓ {f}</li>
            ))}
          </ul>
          <button onClick={() => onSelect(p.tier)} style={{
            width: '100%', padding: '12px', border: 'none', borderRadius: 8,
            background: currentTier === p.tier ? '#9ca3af' : p.color,
            color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer'
          }}>{currentTier === p.tier ? 'Current Plan' : p.tier === 'free' ? 'Get Started' : 'Subscribe'}</button>
        </div>
      ))}
    </div>
  );
}
