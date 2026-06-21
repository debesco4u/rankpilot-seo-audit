import { useState, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
const PAYPAL_EMAIL = 'dumbele23@gmail.com';
const PRICES: Record<string,number> = { diy: 15, whitelabel: 20 };
interface Props { user: User; onPlanChange: (plan:string,token:string)=>void; }
export default function AccountPage({ user, onPlanChange }: Props) {
  const [payments,setPayments]=useState<any[]>([]); const [upgrading,setUpgrading]=useState('');
  useEffect(() => { api.getPaymentHistory().then(d=>setPayments(d.payments)).catch(()=>{}); }, []);
  const startUpgrade = (plan:string) => { window.open('https://paypal.me/'+PAYPAL_EMAIL+'/'+PRICES[plan],'_blank'); setUpgrading(plan); };
  const confirmPayment = async () => {
    try { const data = await api.activatePlan(upgrading); onPlanChange(data.plan,data.token); setUpgrading('');
      api.getPaymentHistory().then(d=>setPayments(d.payments)); } catch(e:any) { alert(e.message); }
  };
  const cancelPlan = async () => {
    if (!confirm('Downgrade to Free plan?')) return;
    try { const data = await api.cancelPlan(); onPlanChange(data.plan,data.token); } catch(e:any) { alert(e.message); }
  };
  const planLabel = (p:string) => p==='free'?'Free':p==='diy'?'DIY SEO ($15/mo)':'White Label ($20/mo)';
  const planColor = (p:string) => p==='free'?'#6b7280':p==='diy'?'#3b82f6':'#8b5cf6';
  return (
    <div style={{maxWidth:600,margin:'0 auto',padding:24}}>
      <h1 style={{color:'#1e3a8a'}}>Account</h1>
      <div style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:24}}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Plan:</strong> <span style={{background:planColor(user.plan),color:'white',padding:'4px 12px',borderRadius:12,fontSize:'0.85rem'}}>{planLabel(user.plan)}</span></p>
      </div>
      {upgrading&&(
        <div style={{background:'#eff6ff',border:'2px solid #3b82f6',borderRadius:12,padding:24,marginBottom:24,textAlign:'center'}}>
          <h3 style={{color:'#1e3a8a',margin:'0 0 12px'}}>Complete Your Payment</h3>
          <p>After paying via PayPal, click below to activate:</p>
          <button onClick={confirmPayment} style={{background:'#22c55e',color:'white',border:'none',padding:'12px 32px',borderRadius:8,fontSize:'1rem',fontWeight:600,cursor:'pointer',marginRight:8}}>I've Completed Payment</button>
          <button onClick={()=>setUpgrading('')} style={{background:'#e5e7eb',color:'#374151',border:'none',padding:'12px 24px',borderRadius:8,cursor:'pointer'}}>Cancel</button>
        </div>
      )}
      {!upgrading&&(
        <div style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',marginBottom:24}}>
          <h3 style={{color:'#1e3a8a',marginTop:0}}>Manage Plan</h3>
          {user.plan==='free'&&<div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button onClick={()=>startUpgrade('diy')} style={{flex:1,padding:16,background:'#3b82f6',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontSize:'1rem',fontWeight:600,minWidth:200}}>Upgrade to DIY SEO - $15/mo</button>
            <button onClick={()=>startUpgrade('whitelabel')} style={{flex:1,padding:16,background:'#8b5cf6',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontSize:'1rem',fontWeight:600,minWidth:200}}>Upgrade to White Label - $20/mo</button>
          </div>}
          {user.plan==='diy'&&<div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button onClick={()=>startUpgrade('whitelabel')} style={{flex:1,padding:16,background:'#8b5cf6',color:'white',border:'none',borderRadius:10,cursor:'pointer',fontSize:'1rem',fontWeight:600}}>Upgrade to White Label - $20/mo</button>
            <button onClick={cancelPlan} style={{padding:16,background:'#f3f4f6',color:'#6b7280',border:'none',borderRadius:10,cursor:'pointer'}}>Downgrade</button>
          </div>}
          {user.plan==='whitelabel'&&<button onClick={cancelPlan} style={{padding:16,background:'#f3f4f6',color:'#6b7280',border:'none',borderRadius:10,cursor:'pointer'}}>Downgrade to Free</button>}
        </div>
      )}
      {payments.length>0&&(
        <div style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{color:'#1e3a8a',marginTop:0}}>Payment History</h3>
          {payments.map((p:any,i:number)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<payments.length-1?'1px solid #f3f4f6':'none'}}>
              <span>{planLabel(p.plan)}</span><span>${p.amount}</span>
              <span style={{color:'#888',fontSize:'0.85rem'}}>{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
