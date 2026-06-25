import React from 'react';
import type { Tier } from '../types';

interface Props {
  tier: Tier;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ tier, onClose, onSuccess }: Props) {
  const price = tier === 'diy' ? 15 : 20;
  const name = tier === 'diy' ? 'DIY SEO' : 'White Label';

  const handlePayPal = () => {
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=dumbele23@gmail.com&item_name=RankPilot+${encodeURIComponent(name)}+Plan&amount=${price}&currency_code=USD&return=${window.location.origin}/payment-success?tier=${tier}&cancel_return=${window.location.origin}`;
    window.open(paypalUrl, '_blank');
    // After payment, user clicks confirm
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('rp_token');
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tier })
      });
      if (res.ok) onSuccess();
    } catch {}
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:420, maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
        <h2 style={{ margin:'0 0 8px' }}>Subscribe to {name}</h2>
        <p style={{ color:'#6b7280', margin:'0 0 24px' }}>${price}/month</p>
        <button onClick={handlePayPal} style={{
          width:'100%',padding:14,border:'none',borderRadius:8,background:'#0070ba',color:'#fff',
          fontWeight:600,fontSize:16,cursor:'pointer',marginBottom:12
        }}>🅿 Pay with PayPal</button>
        <button onClick={handleConfirm} style={{
          width:'100%',padding:14,border:'none',borderRadius:8,background:'#22c55e',color:'#fff',
          fontWeight:600,fontSize:16,cursor:'pointer',marginBottom:12
        }}>✓ I have completed payment</button>
        <button onClick={onClose} style={{
          width:'100%',padding:12,border:'1px solid #d1d5db',borderRadius:8,background:'#fff',
          color:'#374151',fontWeight:500,fontSize:15,cursor:'pointer'
        }}>Cancel</button>
      </div>
    </div>
  );
}
