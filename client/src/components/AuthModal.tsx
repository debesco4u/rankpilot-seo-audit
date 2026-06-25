import React, { useState } from 'react';
import { api } from '../api';
import type { User } from '../types';

interface Props {
  onClose: () => void;
  onAuth: (user: User, token: string) => void;
}

export default function AuthModal({ onClose, onAuth }: Props) {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'signup'
        ? await api.signup(email, password, name)
        : await api.login(email, password);
      localStorage.setItem('rp_token', res.token);
      onAuth(res.user, res.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:400, maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
        <h2 style={{ margin:0,marginBottom:20 }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)}
              style={{ width:'100%',padding:12,borderRadius:8,border:'1px solid #d1d5db',marginBottom:12,fontSize:15,boxSizing:'border-box' }}/>
          )}
          <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required
            style={{ width:'100%',padding:12,borderRadius:8,border:'1px solid #d1d5db',marginBottom:12,fontSize:15,boxSizing:'border-box' }}/>
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required
            style={{ width:'100%',padding:12,borderRadius:8,border:'1px solid #d1d5db',marginBottom:12,fontSize:15,boxSizing:'border-box' }}/>
          {error && <div style={{ color:'#ef4444',fontSize:13,marginBottom:12 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width:'100%',padding:12,border:'none',borderRadius:8,background:'#1e3a8a',color:'#fff',
            fontWeight:600,fontSize:15,cursor:'pointer',opacity:loading?0.7:1
          }}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
        </form>
        <p style={{ textAlign:'center',marginTop:16,fontSize:14,color:'#6b7280' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color:'#1e3a8a',cursor:'pointer',fontWeight:600 }}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}
