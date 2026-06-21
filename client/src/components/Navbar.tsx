import { User } from '../types';
interface Props { user: User|null; page: string; setPage: (p:any)=>void; onLogin:()=>void; onRegister:()=>void; onLogout:()=>void; }
export default function Navbar({ user, page, setPage, onLogin, onRegister, onLogout }: Props) {
  const ls = (p:string) => ({cursor:'pointer',padding:'8px 16px',borderRadius:8,background:page===p?'rgba(255,255,255,0.2)':'transparent',color:'white',border:'none',fontSize:'0.9rem',fontWeight:500 as const});
  return (
    <nav style={{background:'#1e3a8a',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
      <div style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>setPage('home')}>
        <img src="/dabisoft-logo.png" alt="Logo" style={{width:32,height:32,borderRadius:6}} />
        <span style={{color:'white',fontSize:'1.2rem',fontWeight:700}}>RankPilot</span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <button style={ls('home')} onClick={()=>setPage('home')}>Home</button>
        {user && <button style={ls('dashboard')} onClick={()=>setPage('dashboard')}>Dashboard</button>}
        {user && <button style={ls('account')} onClick={()=>setPage('account')}>Account</button>}
        {user ? (
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{color:'rgba(255,255,255,0.8)',fontSize:'0.85rem'}}>{user.email}
              <span style={{background:'rgba(255,255,255,0.2)',padding:'2px 8px',borderRadius:12,fontSize:'0.75rem',marginLeft:4}}>
                {user.plan==='free'?'Free':user.plan==='diy'?'DIY SEO':'White Label'}</span></span>
            <button onClick={onLogout} style={{background:'rgba(255,255,255,0.15)',color:'white',border:'none',padding:'6px 14px',borderRadius:6,cursor:'pointer',fontSize:'0.85rem'}}>Logout</button>
          </div>
        ) : (
          <div style={{display:'flex',gap:8}}>
            <button onClick={onLogin} style={{background:'transparent',color:'white',border:'1px solid rgba(255,255,255,0.3)',padding:'6px 16px',borderRadius:6,cursor:'pointer'}}>Log In</button>
            <button onClick={onRegister} style={{background:'#22c55e',color:'white',border:'none',padding:'6px 16px',borderRadius:6,cursor:'pointer',fontWeight:600}}>Sign Up Free</button>
          </div>
        )}
      </div>
    </nav>
  );
}
