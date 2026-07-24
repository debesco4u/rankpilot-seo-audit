import React, { useState, useEffect } from 'react';
import { User, AuditResult } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './components/Landing';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { AuditPage } from './components/AuditPage';
import { AuditHistory } from './components/AuditHistory';
import { PricingCards } from './components/PricingCards';
import { AccountPage } from './components/AccountPage';
import { ResetPassword } from './components/ResetPassword';
import './styles.css';

const App: React.FC = () => {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Detect reset-password page — path match OR token param with reset path hint
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const hasResetToken = params.has('token');
  const isResetPage = path === '/reset-password' || (path === '' && hasResetToken);
  
  console.log('[APP] Route:', { path, hasResetToken, isResetPage });

  useEffect(() => {
    const token = localStorage.getItem('seo_token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.user) setUser(d.user); else handleLogout(); })
        .catch(() => handleLogout());
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('seo_token');
    setView('landing');
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setShowAuth(false);
    setView('dashboard');
  };

  const handleAnalyseClick = () => {
    if (!user) {
      setAuthMode('login');
      setShowAuth(true);
    } else {
      setView('audit');
    }
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const handleAuditResult = (result: AuditResult) => {
    setAuditResult(result);
    setView('dashboard');
  };

  if (isResetPage) return <ResetPassword />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={user}
        onLogin={() => { setAuthMode('login'); setShowAuth(true); }}
        onSignup={handleSignup}
        onLogout={handleLogout}
        onNavigate={setView}
      />

      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}

      <main className="flex-1">
        {view === 'landing' && <Landing onAnalyse={handleAnalyseClick} onSignup={handleSignup} />}
        {view === 'dashboard' && user && <Dashboard result={auditResult} user={user} />}
        {view === 'audit' && user && <AuditPage user={user} onResult={handleAuditResult} onLogin={() => { setAuthMode('login'); setShowAuth(true); }} />}
        {view === 'history' && user && <AuditHistory token={localStorage.getItem('seo_token') || ''} />}
        {view === 'pricing' && <PricingCards token={localStorage.getItem('seo_token') || ''} currentPlan={user?.plan || 'free'} user={user} onPlanChange={(p: any) => { if (user) setUser({...user, plan: p}); }} onSignup={handleSignup} />}
        {view === 'account' && user && <AccountPage token={localStorage.getItem('seo_token') || ''} onLogout={handleLogout} />}
      </main>

      <Footer />

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
          onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  );
};

export default App;
