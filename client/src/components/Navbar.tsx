import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../types';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onLoginClick, onLogout }: Props) {
  const navigate = useNavigate();
  const loc = useLocation();

  const GlobeIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 32px', background: '#fff', borderBottom: '2px solid #16a34a',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <GlobeIcon />
        <span style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>SEO Audit Tool</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user ? (
          <>
            <button onClick={() => navigate('/dashboard')} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: loc.pathname === '/dashboard' ? '#f0fdf4' : 'transparent',
              color: '#16a34a', fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}>Dashboard</button>
            <button onClick={() => navigate('/account')} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: loc.pathname === '/account' ? '#f0fdf4' : 'transparent',
              color: '#16a34a', fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}>Account</button>
            <button onClick={onLogout} style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid #d1d5db',
              background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 14
            }}>Logout</button>
          </>
        ) : (
          <button onClick={onLoginClick} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14
          }}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
