import React, { useState } from 'react';

const LOGO = '/dabisoft-logo.png';

interface Props { user: any; onLoginClick: () => void; onLogout: () => void; onAccount?: () => void; onHome?: () => void; }

export default function Navbar({ user, onLoginClick, onLogout, onAccount, onHome }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const link: React.CSSProperties = { color:'#fff',cursor:'pointer',fontWeight:500,fontSize:15,background:'none',border:'none',padding:'8px 4px' };

  return (
    <nav style={{ background:'#16a34a',padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56,position:'relative' }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }} onClick={onHome}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z"/></svg>
        <span style={{ color:'#fff',fontWeight:800,fontSize:18 }}>SEO Audit Tool</span>
      </div>

      {/* Desktop links */}
      <div className="nav-links-desktop" style={{ display:'flex',gap:8,alignItems:'center' }}>
        {user ? (<>
          <button style={link} onClick={onAccount}>Account</button>
          <span style={{ color:'rgba(255,255,255,.6)',fontSize:14 }}>{user.email}</span>
          <button style={{...link,color:'#bbf7d0'}} onClick={onLogout}>Logout</button>
        </>) : (
          <button style={link} onClick={onLoginClick}>Sign In</button>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="nav-hamburger" onClick={()=>setMenuOpen(!menuOpen)} style={{ display:'none',background:'none',border:'none',color:'#fff',fontSize:28,cursor:'pointer',padding:4 }}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="nav-mobile-menu" style={{ position:'absolute',top:56,right:0,left:0,background:'#16a34a',padding:'12px 16px',display:'flex',flexDirection:'column',gap:8,zIndex:999,borderTop:'1px solid rgba(255,255,255,.2)' }}>
          {user ? (<>
            <button style={{...link,textAlign:'left'}} onClick={()=>{onAccount?.();setMenuOpen(false);}}>Account</button>
            <span style={{ color:'rgba(255,255,255,.7)',fontSize:13,padding:'4px' }}>{user.email}</span>
            <button style={{...link,textAlign:'left',color:'#bbf7d0'}} onClick={()=>{onLogout();setMenuOpen(false);}}>Logout</button>
          </>) : (
            <button style={{...link,textAlign:'left'}} onClick={()=>{onLoginClick();setMenuOpen(false);}}>Sign In</button>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:640px){
          .nav-links-desktop{display:none!important}
          .nav-hamburger{display:block!important}
        }
      `}</style>
    </nav>
  );
}
