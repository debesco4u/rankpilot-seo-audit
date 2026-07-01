import React, { useState } from 'react';
import { api } from '../api';

interface Props { onClose: () => void; onAuth: (user: any, token: string) => void; }

export default function AuthModal({ onClose, onAuth }: Props) {
  const [mode, setMode] = useState<'login'|'register'|'forgot'|'reset'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [name, setName] = useState(''); const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(''); const [newPw, setNewPw] = useState('');
  const [info, setInfo] = useState('');


  const submit = async () => {
    setError('');
    try {
      if (mode === 'register') {
        const r = await api.register(name, email, password);
        onAuth(r.user, r.token);
      } else if (mode === 'login') {
        const r = await api.login(email, password);
        onAuth(r.user, r.token);
      } else if (mode === 'forgot') {
        const r = await api.forgotPassword(email);
        setInfo(r.message || 'If that email exists, a reset token was generated.');
        setResetToken(r.resetToken || '');
        setMode('reset');
      } else {
        const r = await api.resetPassword(resetToken, newPw);
        setInfo(r.message || 'Password reset! You can now log in.');
        setMode('login');
      }
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
  };

  const overlay: React.CSSProperties = { position:'fixed',inset:0,background:'rgba(0,0,0,.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16 };
  const card: React.CSSProperties = { background:'#fff',borderRadius:16,padding:'32px 24px',width:'100%',maxWidth:400,boxSizing:'border-box',position:'relative' };
  const inp: React.CSSProperties = { width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:15,marginBottom:12,boxSizing:'border-box' };
  const btn: React.CSSProperties = { width:'100%',padding:'12px',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,cursor:'pointer' };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute',top:12,right:16,background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#9ca3af' }}>&times;</button>
        <h2 style={{ textAlign:'center',margin:'0 0 20px',color:'#111' }}>
          {mode==='login'?'Sign In':mode==='register'?'Create Account':mode==='forgot'?'Forgot Password':'Reset Password'}
        </h2>
        {error && <div style={{ background:'#fef2f2',color:'#dc2626',padding:10,borderRadius:8,marginBottom:12,fontSize:14 }}>{error}</div>}
        {info && <div style={{ background:'#f0fdf4',color:'#16a34a',padding:10,borderRadius:8,marginBottom:12,fontSize:14 }}>{info}</div>}

        {mode==='forgot' && (<>
          <input style={inp} placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button style={btn} onClick={submit}>Send Reset Token</button>
          <p style={{ textAlign:'center',marginTop:14,fontSize:14 }}>
            <span style={{ color:'#16a34a',cursor:'pointer',fontWeight:600 }} onClick={()=>{setMode('login');setError('');setInfo('');}}>Back to Sign In</span>
          </p>
        </>)}

        {mode==='reset' && (<>
          <input style={inp} placeholder="Reset token" value={resetToken} onChange={e=>setResetToken(e.target.value)} />
          <input style={inp} type="password" placeholder="New password" value={newPw} onChange={e=>setNewPw(e.target.value)} />
          <button style={btn} onClick={submit}>Reset Password</button>
        </>)}

        {mode==='login' && (<>
          <input style={inp} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <p style={{ textAlign:'right',margin:'-4px 0 12px',fontSize:13 }}>
            <span style={{ color:'#16a34a',cursor:'pointer' }} onClick={()=>{setMode('forgot');setError('');setInfo('');}}>Forgot password?</span>
          </p>
          <button style={btn} onClick={submit}>Sign In</button>
          <p style={{ textAlign:'center',marginTop:14,fontSize:14 }}>No account? <span style={{ color:'#16a34a',cursor:'pointer',fontWeight:600 }} onClick={()=>{setMode('register');setError('');}}>Register</span></p>
        </>)}

        {mode==='register' && (<>
          <input style={inp} placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <input style={inp} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button style={btn} onClick={submit}>Create Account</button>
          <p style={{ textAlign:'center',marginTop:14,fontSize:14 }}>Have an account? <span style={{ color:'#16a34a',cursor:'pointer',fontWeight:600 }} onClick={()=>{setMode('login');setError('');}}>Sign In</span></p>
        </>)}
      </div>
    </div>
  );
}
