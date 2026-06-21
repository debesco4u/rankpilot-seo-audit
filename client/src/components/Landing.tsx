interface Props { onGetStarted: ()=>void; }
export default function Landing({ onGetStarted }: Props) {
  return (
    <div>
      <section style={{background:'linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)',color:'white',padding:'80px 24px',textAlign:'center'}}>
        <h1 style={{fontSize:'3rem',marginBottom:16,fontWeight:800}}>RankPilot SEO Audit</h1>
        <p style={{fontSize:'1.3rem',opacity:0.9,maxWidth:600,margin:'0 auto 32px'}}>
          Get a comprehensive SEO audit of your entire website in seconds. Page-by-page analysis, keyword strategy, and a 90-day action plan.</p>
        <button onClick={onGetStarted}
          style={{background:'#22c55e',color:'white',border:'none',padding:'16px 40px',borderRadius:12,fontSize:'1.1rem',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 20px rgba(34,197,94,0.4)'}}>
          Start Free Audit</button>
      </section>
      <section style={{padding:'60px 24px',maxWidth:1000,margin:'0 auto'}}>
        <h2 style={{textAlign:'center',color:'#1e3a8a',marginBottom:40}}>What You Get</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:24}}>
          {[{icon:'🔍',title:'Full Site Crawl',desc:'We crawl every page, not just the homepage.'},
            {icon:'📊',title:'Page-by-Page Scores',desc:'Each page gets its own score with specific issues.'},
            {icon:'🔑',title:'Keyword Strategy',desc:'Discover top keywords and optimize content.'},
            {icon:'📋',title:'90-Day Action Plan',desc:'A prioritized roadmap to improve rankings.'},
            {icon:'📄',title:'PDF Reports',desc:'Download beautiful, client-ready PDF reports.'},
            {icon:'🏷️',title:'White Label',desc:'Remove branding and present as your own.'}
          ].map((f,i)=>(
            <div key={i} style={{background:'white',borderRadius:12,padding:24,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',textAlign:'center'}}>
              <div style={{fontSize:'2.5rem',marginBottom:12}}>{f.icon}</div>
              <h3 style={{color:'#1e3a8a',marginBottom:8}}>{f.title}</h3>
              <p style={{color:'#666',lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{padding:'60px 24px',background:'#f8fafc'}}>
        <h2 style={{textAlign:'center',color:'#1e3a8a',marginBottom:40}}>Simple Pricing</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:24,maxWidth:1000,margin:'0 auto'}}>
          {[{name:'Free',price:'$0',color:'#6b7280',features:['5 audits per day','General overview','Basic PDF report','Top 5 keywords']},
            {name:'DIY SEO',price:'$15/mo',color:'#3b82f6',features:['Unlimited audits','Full page-by-page analysis','Fix recommendations','Keyword strategy','90-day action plan','Detailed PDF']},
            {name:'White Label',price:'$20/mo',color:'#8b5cf6',features:['Everything in DIY SEO','Remove all branding','Client-ready PDFs','Priority support']}
          ].map((p,i)=>(
            <div key={i} style={{background:'white',borderRadius:16,padding:32,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',textAlign:'center',
              border:i===1?'2px solid #3b82f6':'1px solid #e5e7eb',position:'relative'}}>
              {i===1&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#3b82f6',color:'white',padding:'4px 16px',borderRadius:20,fontSize:'0.8rem',fontWeight:600}}>Most Popular</div>}
              <h3 style={{color:p.color,marginBottom:4}}>{p.name}</h3>
              <div style={{fontSize:'2.5rem',fontWeight:800,color:'#1f2937',marginBottom:16}}>{p.price}</div>
              <ul style={{listStyle:'none',padding:0,margin:'0 0 24px',textAlign:'left'}}>
                {p.features.map((f,j)=><li key={j} style={{padding:'6px 0',color:'#4b5563',fontSize:'0.95rem'}}>✓ {f}</li>)}
              </ul>
              <button onClick={onGetStarted} style={{width:'100%',padding:12,background:p.color,color:'white',border:'none',borderRadius:8,fontSize:'1rem',fontWeight:600,cursor:'pointer'}}>
                {i===0?'Get Started Free':'Subscribe'}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
