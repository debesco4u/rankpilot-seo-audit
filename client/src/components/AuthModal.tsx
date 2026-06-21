import { useState } from 'react';
interface Props { mode:'login'|'register'; onSubmit:(e:string,p:string,n?:string)=>Promise<void>; onToggleMode:()=>void; onClose:()=>void; }
export default function AuthModal({ mode, onSubmit, onToggleMode, onClose }: Props) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
  const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onSubmit(email,password,name); } catch(err:any) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:1000}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'white',borderRadius:16,padding:32,width:400,maxWidth:'90vw',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <h2 style={{margin:'0 0 20px',textAlign:'center',color:'#1e3a8a'}}>{mode==='login'?'Welcome Back':'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {mode==='register'&&<input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)}
            style={{width:'100%',padding:12,marginBottom:12,border:'1px solid #ddd',borderRadius:8,fontSize:'1rem',boxSizing:'border-box'}} />}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required
            style={{width:'100%',padding:12,marginBottom:12,border:'1px solid #ddd',borderRadius:8,fontSize:'1rem',boxSizing:'border-box'}} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}
            style={{width:'100%',padding:12,marginBottom:16,border:'1px solid #ddd',borderRadius:8,fontSize:'1rem',boxSizing:'border-box'}} />
          {error&&<div style={{color:'#ef4444',marginBottom:12,fontSize:'0.9rem',textAlign:'center'}}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:14,background:'#1e3a8a',color:'white',border:'none',borderRadius:8,fontSize:'1rem',fontWeight:600,cursor:'pointer',opacity:loading?0.7:1}}>
            {loading?'Please wait...':mode==='login'?'Log In':'Create Account'}</button>
        </form>
        <p style={{textAlign:'center',marginTop:16,fontSize:'0.9rem',color:'#666'}}>
          {mode==='login'?"Don't have an account? ":"Already have an account? "}
          <span onClick={onToggleMode} style={{color:'#1e3a8a',cursor:'pointer',fontWeight:600}}>{mode==='login'?'Sign up':'Log in'}</span>
        </p>
      </div>
    </div>
  );
}
