import React from 'react';
import PricingCards from './PricingCards';
import type { User, Tier } from '../types';

interface Props { user: User; onSelectTier: (tier: Tier) => void; }

export default function AccountPage({ user, onSelectTier }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' as const }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(22px, 5vw, 28px)' }}>My Account</h1>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
        padding: '24px 20px', marginBottom: 32, boxSizing: 'border-box' as const
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <div><div style={{ fontSize: 13, color: '#6b7280' }}>Name</div><div style={{ fontWeight: 600 }}>{user.name}</div></div>
          <div><div style={{ fontSize: 13, color: '#6b7280' }}>Email</div><div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{user.email}</div></div>
          <div><div style={{ fontSize: 13, color: '#6b7280' }}>Plan</div><div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{user.tier}</div></div>
        </div>
      </div>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)' }}>Change Plan</h2>
      <PricingCards currentTier={user.tier} onSelect={onSelectTier} />
    </div>
  );
}
