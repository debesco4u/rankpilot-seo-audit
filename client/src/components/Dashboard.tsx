import { useState } from 'react';
import { api } from '../api';
import { User, SiteAudit } from '../types';
import ScoreCircle from './ScoreCircle';

export default function Dashboard({ user }: { user: User|null }) {
  const [url,setUrl]=useState(''); const [loading,setLoading]=useState(false);
  const [audit,setAudit]=useState<SiteAudit|null>(null); const [auditId,setAuditId]=useState('');
  const [error,setError]=useState(''); const [plan,setPlan]=useState('');

  const runAudit = async () => {
    if (!url) return; setLoading(true); setError(''); setAudit(null);
    try {
      let u = url.trim(); if (!u.startsWith('http')) u = 'https://'+u;
      const data = await api.runAudit(u);
      setAudit(data.audit); setPlan(data.plan); setAuditId(data.id);
    } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  };

  const downloadPdf = () => {
    if (!auditId) return;
    const token = localStorage.getItem('rp_token');
    const url = api.getPdfUrl(auditId) + (token ? '?token=' + token : '');
    window.open(url, '_blank');
  };

  const sevColor = (s:string) => s==='critical'?'#ef4444':s==='warning'?'#eab308':'#22c55e';

  return (
    <div style={{maxWidth:1000,margin:'0 auto',padding:24}}>
      <h1 style={{color:'#1e3a8a',marginBottom:8}}>SEO Audit Dashboard</h1>
      {user&&<p style={{color:'#666',marginBottom:24}}>Plan: <strong>{user.plan==='free'?'Free':user.plan==='diy'?'DIY SEO':'White Label'}</strong></p>}
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Enter website URL (e.g. example.com)"
          onKeyDown={e=>e.key==='Enter'&&runAudit()}
          style={{flex:1,padding:14,border:'2px solid #e5e7eb',borderRadius:10,fontSize:'1rem'}} />
        <button onClick={runAudit} disabled={loading||!url}
          style={{padding:'14px 28px',background:'#1e3a8a',color:'white',border:'none',borderRadius:10,fontSize:'1rem',fontWeight:600,cursor:'pointer',opacity:loading?0.7:1,minWidth:140}}>
          {loading?'Auditing...':'Run Audit'}</button>
      </div>
      {loading&&<div style={{textAlign:'center',padding:60}}>
        <div style={{fontSize:'1.2rem',color:'#1e3a8a',marginBottom:8}}>Crawling & analyzing pages...</div>
        <div style={{color:'#666'}}>This may take 30-60 seconds</div></div>}
      {error&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',color:'#ef4444',padding:16,borderRadius:10,marginBottom:24}}>{error}</div>}
      {audit&&(
        <div>
          <div style={{display:'flex',alignItems:'center',gap:32,background:'white',padding:24,borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:24,flexWrap:'wrap'}}>
            <ScoreCircle score={audit.overallScore} size={140} />
            <div style={{flex:1}}>
              <h2 style={{margin:'0 0 8px',color:'#1e3a8a'}}>{audit.url}</h2>
              <p style={{color:'#666',margin:0}}>{audit.totalPages} pages analyzed &bull; {new Date(audit.crawledAt).toLocaleString()}</p>
              <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
                <span style={{color:'#ef4444',fontWeight:600}}>{audit.summary.criticalIssues} critical</span>
                <span style={{color:'#eab308',fontWeight:600}}>{audit.summary.warnings} warnings</span>
                <span style={{color:'#22c55e',fontWeight:600}}>{audit.summary.passed} passed</span>
              </div>
              {auditId && <button onClick={downloadPdf} style={{marginTop:12,padding:'8px 20px',background:'#1e3a8a',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>
                Download PDF Report</button>}
            </div>
          </div>
          {audit.pages.map((page,i) => (
            <div key={i} style={{background:'white',borderRadius:12,padding:20,marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',borderLeft:'4px solid '+(page.score>=80?'#22c55e':page.score>=50?'#eab308':'#ef4444')}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                <div><h3 style={{margin:0,fontSize:'1rem',color:'#1e3a8a',wordBreak:'break-all'}}>{page.url.length>60?page.url.slice(0,57)+'...':page.url}</h3>
                  <span style={{fontSize:'0.8rem',color:'#888'}}>{page.wordCount} words &bull; {(page.loadTime/1000).toFixed(1)}s &bull; {page.imgTotal} images</span></div>
                <ScoreCircle score={page.score} size={60} />
              </div>
              {page.issues.map((issue,j) => (
                <div key={j} style={{padding:'8px 12px',marginBottom:6,borderRadius:8,background:issue.severity==='critical'?'#fef2f2':issue.severity==='warning'?'#fffbeb':'#f0fdf4'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:sevColor(issue.severity),flexShrink:0}} />
                    <span style={{fontWeight:500,fontSize:'0.9rem'}}>{issue.message}</span></div>
                  {issue.fix&&<div style={{marginTop:4,marginLeft:16,fontSize:'0.85rem',color:'#1e40af',background:'#eff6ff',padding:'4px 8px',borderRadius:4}}>Fix: {issue.fix}</div>}
                </div>
              ))}
            </div>
          ))}
          {plan==='free'&&audit.pages.length>=3&&(
            <div style={{textAlign:'center',padding:32,background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',borderRadius:16,color:'white',marginBottom:24}}>
              <h3 style={{margin:'0 0 8px'}}>Unlock Full Report</h3>
              <p style={{margin:'0 0 16px',opacity:0.9}}>Upgrade to see all {audit.totalPages} pages, fix recommendations, keyword strategy, and 90-day action plan</p>
            </div>
          )}
          {audit.topKeywords.length>0&&(
            <div style={{background:'white',borderRadius:12,padding:20,marginTop:24,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <h3 style={{color:'#1e3a8a',marginTop:0}}>Top Keywords</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {audit.topKeywords.map((kw,i)=>(
                  <span key={i} style={{background:'#eff6ff',color:'#1e3a8a',padding:'4px 12px',borderRadius:20,fontSize:'0.85rem'}}>
                    {kw.word} ({kw.count}) - {kw.density}%</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
