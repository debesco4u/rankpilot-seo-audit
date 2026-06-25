import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import AccountPage from './components/AccountPage';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import Footer from './components/Footer';
import type { User, Tier } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [payTier, setPayTier] = useState<Tier | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(u => setUser(u))
        .catch(() => localStorage.removeItem('rp_token'));
    }
  }, []);

  const handleAuth = (u: User, token: string) => {
    setUser(u);
    localStorage.setItem('rp_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rp_token');
    navigate('/');
  };

  const handleSelectTier = (tier: Tier) => {
    if (!user) { setShowAuth(true); return; }
    if (tier === 'free') return;
    setPayTier(tier);
  };

  const handlePaymentSuccess = () => {
    setPayTier(null);
    // Refresh user
    const token = localStorage.getItem('rp_token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(u => setUser(u))
        .catch(() => {});
    }
  };

  const showBranding = user?.tier !== 'whitelabel';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar user={user} onLoginClick={() => setShowAuth(true)} onLogout={handleLogout} />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing user={user} onLoginClick={() => setShowAuth(true)} onSelectTier={handleSelectTier} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Landing user={user} onLoginClick={() => setShowAuth(true)} onSelectTier={handleSelectTier} />} />
          <Route path="/account" element={user ? <AccountPage user={user} onSelectTier={handleSelectTier} /> : <Landing user={user} onLoginClick={() => setShowAuth(true)} onSelectTier={handleSelectTier} />} />
        </Routes>
      </div>
      <Footer showBranding={showBranding} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      {payTier && <PaymentModal tier={payTier} onClose={() => setPayTier(null)} onSuccess={handlePaymentSuccess} />}
    </div>
  );
}
