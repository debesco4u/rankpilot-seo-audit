import { useState, useEffect } from 'react';
import { api, setToken, clearToken } from './api';
import { User } from './types';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import AccountPage from './components/AccountPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<'home' | 'dashboard' | 'account'>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rp_token');
    if (token) {
      api.getMe().then(data => { setUser(data.user); setPage('dashboard'); })
        .catch(() => clearToken()).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const handleAuth = async (email: string, password: string, name?: string) => {
    const data = authMode === 'register' ? await api.register(email, password, name || '') : await api.login(email, password);
    setToken(data.token); setUser(data.user); setShowAuth(false); setPage('dashboard');
  };

  const handleLogout = () => { clearToken(); setUser(null); setPage('home'); };
  const handlePlanChange = (newPlan: string, token: string) => {
    setToken(token); setUser(prev => prev ? { ...prev, plan: newPlan as any } : null);
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
    <div style={{fontSize:'1.5rem',color:'#1e3a8a'}}>Loading...</div></div>;

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <Navbar user={user} page={page} setPage={setPage}
        onLogin={() => { setAuthMode('login'); setShowAuth(true); }}
        onRegister={() => { setAuthMode('register'); setShowAuth(true); }}
        onLogout={handleLogout} />
      <main style={{flex:1}}>
        {page === 'home' && <Landing onGetStarted={() => { if (user) setPage('dashboard'); else { setAuthMode('register'); setShowAuth(true); }}} />}
        {page === 'dashboard' && <Dashboard user={user} />}
        {page === 'account' && user && <AccountPage user={user} onPlanChange={handlePlanChange} />}
      </main>
      <footer style={{background:'#1e3a8a',color:'white',padding:'20px',textAlign:'center',fontSize:'0.85rem'}}>
        <img src="/dabisoft-logo.png" alt="Dabisoft" style={{width:40,height:40,marginBottom:8,borderRadius:8}} />
        <div>Powered by Dabisoft IT Solutions</div>
        <div style={{opacity:0.7,marginTop:4}}>&copy; {new Date().getFullYear()} RankPilot SEO Audit</div>
      </footer>
      {showAuth && <AuthModal mode={authMode} onSubmit={handleAuth}
        onToggleMode={() => setAuthMode(m => m === 'login' ? 'register' : 'login')}
        onClose={() => setShowAuth(false)} />}
    </div>
  );
}
