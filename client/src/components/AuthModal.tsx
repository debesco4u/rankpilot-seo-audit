import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api';

interface Props {
  onAuth: (user: User, token: string) => void;
  onClose: () => void;
}

export default function AuthModal({ onAuth, onClose }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        onAuth(data.user, data.token);
      } else if (mode === 'register') {
        const data = await api.register(email, password, name);
        localStorage.setItem('token', data.token);
        setMsg('Account created successfully! Redirecting...');
        setTimeout(() => onAuth(data.user, data.token), 1200);
        setLoading(false);
        return;
      } else if (mode === 'forgot') {
        await api.forgotPassword(email);
        setMsg('If an account exists, a reset link has been sent.');
      } else if (mode === 'reset') {
        await api.resetPassword(resetToken, newPassword);
        setMsg('Password reset! You can now log in.');
        setMode('login');
      }
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modal: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400, position: 'relative', boxSizing: 'border-box' };
  const input: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' };
  const btn: React.CSSProperties = { width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' };
  const link: React.CSSProperties = { color: '#16a34a', cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, textDecoration: 'underline' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
        <h2 style={{ margin: '0 0 20px', textAlign: 'center' }}>
          {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}
        </h2>
        {error && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14, textAlign: 'center' }}>{error}</div>}
        {msg && <div style={{ color: '#16a34a', marginBottom: 12, fontSize: 14, textAlign: 'center' }}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && <input style={input} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && <input style={input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />}
          {(mode === 'login' || mode === 'register') && <input style={input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />}
          {mode === 'reset' && <>
            <input style={input} placeholder="Reset Token" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
            <input style={input} type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </>}
          <button style={btn} type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'}</button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {mode === 'login' && <>
            <button style={link} onClick={() => setMode('forgot')}>Forgot password?</button>
            <span style={{ margin: '0 8px', color: '#9ca3af' }}>|</span>
            <button style={link} onClick={() => setMode('register')}>Create account</button>
          </>}
          {mode === 'register' && <button style={link} onClick={() => setMode('login')}>Already have an account? Sign in</button>}
          {(mode === 'forgot' || mode === 'reset') && <button style={link} onClick={() => setMode('login')}>Back to sign in</button>}
        </div>
      </div>
    </div>
  );
}
