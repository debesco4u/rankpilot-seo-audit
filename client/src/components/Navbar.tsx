import React, { useState } from 'react';
import { User, Tier } from '../types';

interface Props {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onSelectTier: (tier: Tier) => void;
  onNavigate?: (page: string) => void;
}

const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAclBMVEUAAAAjJi0jJS4jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi0jJi3/rlEUAAAAJXRSTlMA+gXz0BkO5siuSiPbr6F2YFRFLQHY8ezk28W8pZqTi4BwTTcxB3mOjwAAAkBJREFUWMPtl+mSgyAQhAFFwfsW7/v9X3EBNYlJZXez+2OrfP+Mhm6mGab4V/8LHfUEE01f64kJX0ZUYB2V9LBgHCb0aJgNnPnkU7MwJ7S/FJiDS3/e8oJzLvCZjhdx8GmERxfYOsPGXn2csiIOR2FJDwl8b2KmPyBwz4gujPClgWcyJgn9qgzI5CbU/XAfJJz76lEZC09q+PFkiCT6Y3AFYwR4q/FklJfhVtEnXl8VAvEMmhJ0ij+HDCf1/VQGJHGJ/kxOghEJYDEIPlowPzaigLZzOhaBSTHkXcH0jqFgLkiOIcnkbFmtJELLJGd+8SGQF1kbKgCQsJqLuBYIZSAUlASAA2+cNVBbXKqiTJ7DzQiXhFKWGaHGbAYJoB9V6SASEuoJyGAe8O5A2UQAKJscPBBVBkwFKj5xnIdUkCp4dgfQAuB4LDIx7c+BQOM2j0Q0ZbEDEUADNawQSJgcPzxoROYrZAW0EjwIhJsG/VkA+MlE9ADZW/gySOAd3MAGCBhqKBzJ20/ENY0BuasAQH0BfJRYE8sKJ6T6BXKB5F3AhRIJ6Cr4G4fRbwvRcAVKlE+w8sDVdE4N5MgSM0XdDdVOQ7K5vsMU9VoJmWyXN9AH7V+EFmtPa3cYKLhgKb0KLMwlqe3Nzc3Gyi6GZm28i+V2c0p3jZmndA56vbdOALjeDELnzLGH7w5+QaV5L5g9q1sG5H3J7M3vS3HN1mJCiR9Cf6kWfIZVrTJ3s/6D+dN+SdA7Y3TAAAAAElFTkSuQmCC';

export default function Navbar({ user, onLoginClick, onLogout, onSelectTier, onNavigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const nav: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 };
  const brand: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' };
  const globe = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
    </svg>
  );

  const linkStyle: React.CSSProperties = { background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: '#374151', cursor: 'pointer', padding: '6px 12px' };
  const greenBtn: React.CSSProperties = { padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' };
  const hamburger: React.CSSProperties = { display: 'none', background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' };

  return (
    <nav style={nav}>
      <div style={brand} onClick={() => onNavigate?.('home')}>
        {globe}
        <span style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>SEO Audit Tool</span>
      </div>

      {/* Desktop menu */}
      <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button style={linkStyle} onClick={() => onNavigate?.('home')}>Home</button>
        <button style={linkStyle} onClick={() => {
          const el = document.getElementById('pricing');
          el ? el.scrollIntoView({ behavior: 'smooth' }) : onNavigate?.('home');
        }}>Pricing</button>
        {user && <button style={linkStyle} onClick={() => onNavigate?.('dashboard')}>Dashboard</button>}
        {user && <button style={linkStyle} onClick={() => onNavigate?.('account')}>Account</button>}
        {user ? (
          <button style={greenBtn} onClick={onLogout}>Sign Out</button>
        ) : (
          <button style={greenBtn} onClick={onLoginClick}>Sign In</button>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="nav-hamburger" style={hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={linkStyle} onClick={() => { onNavigate?.('home'); setMenuOpen(false); }}>Home</button>
          <button style={linkStyle} onClick={() => { setMenuOpen(false); const el = document.getElementById('pricing'); el ? el.scrollIntoView({ behavior: 'smooth' }) : onNavigate?.('home'); }}>Pricing</button>
          {user && <button style={linkStyle} onClick={() => { onNavigate?.('dashboard'); setMenuOpen(false); }}>Dashboard</button>}
          {user && <button style={linkStyle} onClick={() => { onNavigate?.('account'); setMenuOpen(false); }}>Account</button>}
          {user ? (
            <button style={greenBtn} onClick={() => { onLogout(); setMenuOpen(false); }}>Sign Out</button>
          ) : (
            <button style={greenBtn} onClick={() => { onLoginClick(); setMenuOpen(false); }}>Sign In</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
