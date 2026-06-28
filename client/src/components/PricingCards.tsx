import React from 'react';
import type { Tier } from '../types';

interface Props {
  currentTier?: Tier;
  onSelect: (tier: Tier) => void;
}

const plans = [
  {
    tier: 'free' as Tier, name: 'Free', price: '$0', period: 'forever',
    features: ['General SEO audit', '5 searches per day', 'Basic issue detection', 'Overall score'],
    cta: 'Get Started'
  },
  {
    tier: 'diy' as Tier, name: 'DIY SEO', price: '$15', period: '/month',
    features: ['Full multi-page crawl', 'Unlimited audits', 'Detailed fix recommendations', 'Keyword strategy', '90-day action plan', 'Priority support'],
    cta: 'Start DIY SEO', popular: true
  },
  {
    tier: 'whitelabel' as Tier, name: 'White Label', price: '$20', period: '/month',
    features: ['Everything in DIY SEO', 'Professional PDF report', 'Remove Dabisoft branding', 'Client-ready exports', 'Custom report branding', 'Bulk audits'],
    cta: 'Go White Label'
  },
];

export default function PricingCards({ currentTier, onSelect }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {plans.map(p => {
        const isCurrent = currentTier === p.tier;
        return (
          <div key={p.tier} style={{
            background: '#fff', borderRadius: 16, padding: 32,
            border: p.popular ? '2px solid #16a34a' : '1px solid #e5e7eb',
            position: 'relative', textAlign: 'center',
            boxShadow: p.popular ? '0 8px 30px rgba(22,163,74,0.15)' : 'none'
          }}>
            {p.popular && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: '#16a34a', color: '#fff', padding: '4px 16px', borderRadius: 20,
                fontSize: 12, fontWeight: 700
              }}>MOST POPULAR</div>
            )}
            <h3 style={{ margin: '8px 0 4px', fontSize: 22, color: '#111' }}>{p.name}</h3>
            <div style={{ margin: '12px 0 20px' }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: '#111' }}>{p.price}</span>
              <span style={{ color: '#6b7280', fontSize: 15 }}>{p.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' }}>
              {p.features.map((f, i) => (
                <li key={i} style={{ padding: '6px 0', fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => onSelect(p.tier)} disabled={isCurrent} style={{
              width: '100%', padding: 14, borderRadius: 10, border: 'none',
              background: isCurrent ? '#d1d5db' : p.popular ? '#16a34a' : '#f0fdf4',
              color: isCurrent ? '#9ca3af' : p.popular ? '#fff' : '#16a34a',
              fontWeight: 700, fontSize: 15, cursor: isCurrent ? 'default' : 'pointer'
            }}>{isCurrent ? 'Current Plan' : p.cta}</button>
          </div>
        );
      })}
    </div>
  );
}
