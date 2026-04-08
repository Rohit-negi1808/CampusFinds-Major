import React, { useState, useEffect, useRef } from 'react'

const Stars = ({ n }) => <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=n?'#f59e0b':'#e2e8f0',fontSize:'0.9rem'}}>★</span>)}</span>

export default function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled]       = useState(false)
  const [statsActive, setStatsActive] = useState(false)
  const [liveStats, setLiveStats]     = useState({ totalItems:0, returned:0, students:0 })
  const [stories, setStories]         = useState([])
  const statsRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setStatsActive(true) }, { threshold:0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const [sR, fbR] = await Promise.all([fetch(`${baseUrl}/api/analytics/stats`), fetch(`${baseUrl}/api/feedback/public`)])
        if (sR.ok) { const s = await sR.json(); setLiveStats({ totalItems:s.totalItems||0, returned:s.returned||0, students:s.students||0 }) }
        if (fbR.ok) setStories((await fbR.json()).slice(0,3))
      } catch{}
    })()
  }, [])

  const Num = ({ n, suffix='+' }) => {
    const [v, setV] = useState(0)
    useEffect(() => {
      if (!statsActive || !n) return
      let c=0; const step=n/55
      const t = setInterval(()=>{ c+=step; if(c>=n){setV(n);clearInterval(t)}else setV(Math.floor(c)) }, 20)
      return ()=>clearInterval(t)
    }, [statsActive, n])
    return <>{v.toLocaleString()}{suffix}</>
  }

  const FEATURES = [

  { icon:'🔍', title:'Advanced Search',
    desc:'Quickly find lost items using filters like category, date, and location.' },

  { icon:'📢', title:'Report Items',
    desc:'Easily report lost or found items with details like image, location, and description.' },

  { icon:'📊', title:'Admin Dashboard',
    desc:'Analytics, user management, claim tracking — all in one panel.' },

  { icon:'🙋', title:'Claim System',
    desc:'Prove ownership, admin verifies, pick up at Student Care office.' },

  { icon:'🆔', title:'College ID Login',
    desc:'Secure login using your college ID to ensure only students can access the platform.' },

  { icon:'🌗', title:'Dark & Light Mode',
    desc:'Switch between dark and light themes for a comfortable user experience anytime.' },
]

  /* ── Floating item cards for hero visual ── */
  const DEMO_ITEMS = [
    { icon:'📱', title:'iPhone 15', loc:'NCH-B, Room 301', tag:'Lost', tc:'#991b1b', bc:'#fee2e2', rotate:'-4deg', top:'8%', left:'2%' },
    { icon:'🎒', title:'Black Backpack', loc:'D-Block Canteen', tag:'Found', tc:'#065f46', bc:'#d1fae5', rotate:'3deg', top:'22%', right:'4%' },
    { icon:'🔑', title:'Key Ring', loc:'Library 2F', tag:'Found', tc:'#065f46', bc:'#d1fae5', rotate:'-2deg', top:'55%', left:'0%' },
    { icon:'👛', title:'Brown Wallet', loc:'E-Block Corridor', tag:'Lost', tc:'#991b1b', bc:'#fee2e2', rotate:'4deg', top:'65%', right:'2%' },
  ]

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:'#fff', color:'#1e293b', overflowX:'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes float0{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(-4deg)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
        @keyframes float2{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(-2deg)}}
        @keyframes float3{0%,100%{transform:translateY(0) rotate(4deg)}50%{transform:translateY(-6px) rotate(4deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none}}
        .pill-nav-link{color:#475569;font-size:.875rem;font-weight:500;text-decoration:none;padding:.35rem .8rem;border-radius:99px;transition:all .2s}
        .pill-nav-link:hover{color:#6366f1;background:rgba(99,102,241,.08)}
        .land-cta:hover{transform:translateY(-2px)!important;box-shadow:0 10px 28px rgba(99,102,241,.4)!important}
        .feat-row:hover{background:#f8fafc!important;transform:translateX(4px)}
        @media(max-width:860px){
          .hero-grid{grid-template-columns:1fr!important}
          .hero-visual{display:none!important}
          .steps-row{flex-direction:column!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .stories-grid{grid-template-columns:1fr!important}
          .feat-cols{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ════════════════════════════════════════
          FLOATING PILL NAVBAR (light mode)
          ════════════════════════════════════════ */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:999,
        padding: scrolled ? '8px 1.5rem' : '10px 1.5rem',
        transition:'padding .3s',
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', background:'#fff', borderRadius:999,
          border:'1.5px solid #e2e8f0',
          boxShadow: scrolled ? '0 6px 30px rgba(0,0,0,.12)' : '0 4px 24px rgba(0,0,0,.09)',
          padding:'1rem 1.5rem',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', transition:'box-shadow .3s' }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🔍</div>
            <span style={{ fontSize:'1.1rem', fontWeight:900, color:'#1e293b', letterSpacing:'-0.5px' }}>CampusFinds</span>
          </div>

          {/* Center nav links */}
          <nav style={{ display:'flex', alignItems:'center', gap:'0.2rem' }}>
            {['How it Works','Features','Stories'].map(l=>(
              <a key={l} href={`#${l.replace(/ /g,'').toLowerCase()}`} className="pill-nav-link">{l}</a>
            ))}
          </nav>

          {/* Right CTA */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <button onClick={onGetStarted} style={{ background:'none', border:'none', color:'#475569', fontWeight:600, fontSize:'0.875rem', cursor:'pointer', padding:'0.35rem 0.7rem' }}>Sign In</button>
            <button onClick={onGetStarted} className="land-cta"
              style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:999, padding:'0.5rem 1.2rem', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', transition:'all .2s', boxShadow:'0 4px 14px rgba(99,102,241,.3)' }}>
              Get Started →
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          HERO — split layout, left text + right visual
          ════════════════════════════════════════ */}
      <section style={{ minHeight:'100vh', paddingTop:96, paddingBottom:60, paddingLeft:'1.5rem', paddingRight:'1.5rem', display:'flex', alignItems:'center' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center' }} className="hero-grid">

          {/* Left text */}
          <div style={{ animation:'fadeUp .7s ease both' }}>
            {/* Badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:999, padding:'0.3rem 0.9rem', marginBottom:'1.8rem' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s infinite' }}/>
              <span style={{ color:'#15803d', fontSize:'0.78rem', fontWeight:700 }}>Live at Chandigarh University</span>
            </div>

            {/* Headline — big, editorial */}
            <h1 style={{ fontSize:'clamp(2.4rem,4.5vw,3.8rem)', fontWeight:900, color:'#0f172a', letterSpacing:'-2px', lineHeight:1.1, marginBottom:'1.2rem' }}>
              Your lost item<br/>
              <span style={{ position:'relative', display:'inline-block' }}>
                <span style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>belongs home.</span>
                <svg style={{ position:'absolute', bottom:'-4px', left:0, right:0, width:'100%' }} height="6" viewBox="0 0 200 6">
                  <path d="M0,5 Q50,0 100,5 Q150,10 200,5" stroke="#6366f1" strokeWidth="2.5" fill="none" opacity=".5"/>
                </svg>
              </span>
            </h1>

            <p style={{ fontSize:'1.1rem', color:'#64748b', lineHeight:1.75, marginBottom:'2.2rem', maxWidth:480 }}>
              CampusFinds reunites CU students with their lost belongings. Post a report in minutes, browse found items, and claim yours — all verified by campus admin.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
              <button onClick={onGetStarted} className="land-cta"
                style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:14, padding:'0.9rem 2rem', fontWeight:800, fontSize:'1rem', cursor:'pointer', transition:'all .2s', boxShadow:'0 6px 20px rgba(99,102,241,.3)' }}>
                🔍 Report or Find an Item
              </button>
              <button onClick={onGetStarted}
                style={{ background:'#fff', color:'#374151', border:'1.5px solid #e5e7eb', borderRadius:14, padding:'0.9rem 1.8rem', fontWeight:600, fontSize:'1rem', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                Browse Found Items
              </button>
            </div>
          </div>

          {/* Right visual — floating cards */}
          <div className="hero-visual" style={{ position:'relative', height:520 }}>
            {/* Center blob */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%)' }}/>

            {/* Big center card */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', borderRadius:20, padding:'1.4rem', boxShadow:'0 20px 60px rgba(0,0,0,.12)', border:'1.5px solid #e2e8f0', width:200, zIndex:2 }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.6rem' }}>🔍</div>
                <div style={{ fontWeight:800, color:'#1e293b', fontSize:'0.9rem', marginBottom:'0.3rem' }}>Lost? Found?</div>
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginBottom:'0.9rem' }}>3 simple steps</div>
                <div style={{ display:'grid', gap:'0.4rem' }}>
                  {['📸 Report it','🔎 Match it','🤝 Collect it'].map(s=>(
                    <div key={s} style={{ background:'#f8fafc', borderRadius:8, padding:'0.4rem 0.7rem', fontSize:'0.75rem', fontWeight:600, color:'#475569', textAlign:'left' }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating item cards */}
            {DEMO_ITEMS.map((item,i)=>(
              <div key={i} style={{
                position:'absolute', ...(item.top?{top:item.top}:{}), ...(item.left!==undefined?{left:item.left}:{}), ...(item.right!==undefined?{right:item.right}:{}),
                background:'#fff', borderRadius:14, padding:'0.9rem 1rem', boxShadow:'0 8px 28px rgba(0,0,0,.1)', border:'1.5px solid #e2e8f0', width:165, zIndex:1,
                animation:`float${i} ${3+i*.5}s ease-in-out infinite`, animationDelay:`${i*.4}s`
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.4rem' }}>
                  <span style={{ fontSize:'1.3rem' }}>{item.icon}</span>
                  <span style={{ fontWeight:700, fontSize:'0.82rem', color:'#1e293b' }}>{item.title}</span>
                </div>
                <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginBottom:'0.5rem' }}>📍 {item.loc}</div>
                <span style={{ background:item.bc, color:item.tc, padding:'0.18rem 0.6rem', borderRadius:99, fontSize:'0.68rem', fontWeight:700 }}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          LIVE STATS — horizontal strip
          ════════════════════════════════════════ */}
      <section ref={statsRef} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', padding:'3rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'0' }} className="stats-grid">
          {[
            { n:liveStats.totalItems, suf:'+', label:'Items Reported',     emoji:'📦' },
            { n:liveStats.returned,   suf:'+', label:'Successfully Returned', emoji:'✅' },
            { n:liveStats.students,   suf:'+', label:'Students Registered', emoji:'👥' },
            { n:4,                    suf:'h',  label:'Avg Response Time',   emoji:'⚡' },
          ].map((s,i)=>(
            <div key={s.label} style={{ textAlign:'center', padding:'1rem', borderRight: i<3?'1px solid rgba(255,255,255,.15)':'' }}>
              <div style={{ fontSize:'1.6rem', marginBottom:'0.3rem' }}>{s.emoji}</div>
              <div style={{ fontSize:'2rem', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'-1px', marginBottom:'0.2rem' }}><Num n={s.n} suffix={s.suf}/></div>
              <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,.7)', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — numbered horizontal steps
          ════════════════════════════════════════ */}
      <section id="howitworks" style={{ background:'#f8fafc', padding:'5.5rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
            <p style={{ color:'#6366f1', fontWeight:700, fontSize:'0.73rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.4rem' }}>Simple Process</p>
            <h2 style={{ fontSize:'clamp(1.7rem,3vw,2.3rem)', fontWeight:900, color:'#0f172a', letterSpacing:'-0.5px' }}>Three steps to recover your item</h2>
          </div>

          <div className="steps-row" style={{ display:'flex', gap:'0', position:'relative' }}>
            {/* Connector line */}
            <div style={{ position:'absolute', top:36, left:'16.6%', right:'16.6%', height:2, background:'linear-gradient(90deg,#e2e8f0,#6366f1,#e2e8f0)', zIndex:0 }}/>

            {[
              { n:'1', icon:'📸', bg:'#ede9fe', acc:'#6366f1', title:'Report It', desc:'Snap a photo and fill a quick form. Takes under 2 minutes — lost or found.' },
              { n:'2', icon:'🔎', bg:'#dbeafe', acc:'#3b82f6', title:'Browse & Match', desc:'Search found items by category or location. AI matching helps surface the best candidates.' },
              { n:'3', icon:'🤝', bg:'#d1fae5', acc:'#10b981', title:'Claim & Collect', desc:'Submit a claim with proof of ownership. Admin verifies, then you collect at Student Care.' },
            ].map((s,i)=>(
              <div key={s.n} style={{ flex:1, textAlign:'center', padding:'0 1rem', position:'relative', zIndex:1 }}>
                {/* Number circle */}
                <div style={{ width:72, height:72, borderRadius:'50%', background:s.bg, border:`3px solid ${s.acc}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem', fontSize:'1.6rem', boxShadow:`0 0 0 6px ${s.acc}18` }}>{s.icon}</div>
                <div style={{ width:24, height:24, borderRadius:'50%', background:s.acc, color:'#fff', fontSize:'0.72rem', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', margin:'-2rem auto 0.8rem', position:'relative', zIndex:2 }}>{s.n}</div>
                <h4 style={{ fontWeight:800, color:'#1e293b', marginBottom:'0.5rem', fontSize:'1rem' }}>{s.title}</h4>
                <p style={{ color:'#64748b', fontSize:'0.85rem', lineHeight:1.65, margin:'0 auto', maxWidth:240 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES — 2-col list with icon rows
          ════════════════════════════════════════ */}
      <section id="features" style={{ background:'#fff', padding:'5.5rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }} className="feat-cols">
          {/* Left — text */}
          <div>
            <p style={{ color:'#6366f1', fontWeight:700, fontSize:'0.73rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.6rem' }}>What we offer</p>
            <h2 style={{ fontSize:'clamp(1.7rem,3vw,2.3rem)', fontWeight:900, color:'#0f172a', letterSpacing:'-0.5px', marginBottom:'0.8rem', lineHeight:1.2 }}>Built for CU campus life</h2>
            <p style={{ color:'#64748b', lineHeight:1.75, marginBottom:'2rem', fontSize:'0.95rem' }}>
              CampusFinds is designed specifically for Chandigarh University students. No third-party logins, no clutter — just the tools you need to recover what's yours.
            </p>
            <button onClick={onGetStarted} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:12, padding:'0.8rem 1.8rem', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>
              Get Started Free →
            </button>
          </div>

          {/* Right — feature rows */}
          <div style={{ display:'grid', gap:'0.6rem' }}>
            {FEATURES.map(f=>(
              <div key={f.title} className="feat-row" style={{ display:'flex', alignItems:'flex-start', gap:'0.9rem', padding:'0.9rem 1rem', borderRadius:12, border:'1px solid #f1f5f9', transition:'all .2s', cursor:'default' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:'#1e293b', fontSize:'0.88rem', marginBottom:'0.15rem' }}>{f.title}</div>
                  <div style={{ color:'#64748b', fontSize:'0.8rem', lineHeight:1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          REAL STORIES — card grid
          ════════════════════════════════════════ */}
      <section id="stories" style={{ background:'#f8fafc', padding:'5.5rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem', marginBottom:'3rem' }}>
            <div>
              <p style={{ color:'#6366f1', fontWeight:700, fontSize:'0.73rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.4rem' }}>Real Stories</p>
              <h2 style={{ fontSize:'clamp(1.7rem,3vw,2.3rem)', fontWeight:900, color:'#0f172a', letterSpacing:'-0.5px', margin:0 }}>Students helping students</h2>
              <p style={{ color:'#94a3b8', fontSize:'0.82rem', marginTop:'0.3rem' }}>Actual feedback from verified CU students — not made up</p>
            </div>
            <button onClick={onGetStarted} style={{ background:'#fff', color:'#6366f1', border:'1.5px solid #e2e8f0', borderRadius:20, padding:'0.45rem 1.1rem', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', whiteSpace:'nowrap' }}>Share your story →</button>
          </div>

          {stories.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.8rem', opacity:.3 }}>💬</div>
              <p style={{ marginBottom:'1rem' }}>Be the first student to share a success story!</p>
              <button onClick={onGetStarted} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', borderRadius:10, padding:'0.65rem 1.5rem', fontWeight:700, cursor:'pointer' }}>Sign in to share</button>
            </div>
          ) : (
            <div className="stories-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.2rem' }}>
              {stories.map((s,i)=>(
                <div key={s._id||i} style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:18, padding:'1.8rem', position:'relative', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'all .25s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(0,0,0,.09)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)'; }}>
                  <div style={{ position:'absolute', top:10, left:14, fontSize:'3.5rem', color:'#f1f5f9', lineHeight:1, fontFamily:'Georgia,serif', fontWeight:900, userSelect:'none' }}>"</div>
                  <div style={{ marginBottom:'0.7rem', paddingTop:'0.4rem' }}><Stars n={s.rating}/></div>
                  <p style={{ color:'#475569', lineHeight:1.75, fontSize:'0.875rem', marginBottom:'1.4rem' }}>{s.message}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.78rem', color:'#fff', flexShrink:0 }}>{s.name?.[0]?.toUpperCase()||'?'}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#1e293b' }}>{s.name}</div>
                      {s.itemRecovered && <div style={{ fontSize:'0.73rem', color:'#94a3b8' }}>✅ {s.itemRecovered}</div>}
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:'0.7rem', color:'#94a3b8' }}>{new Date(s.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA — full width indigo
          ════════════════════════════════════════ */}
      <section style={{ background:'linear-gradient(135deg,#4338ca 0%,#6366f1 50%,#8b5cf6 100%)', padding:'6rem 1.5rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,.06)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-30%', right:'-5%', width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,.08)', filter:'blur(50px)' }}/>
        <div style={{ maxWidth:580, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,.15)', borderRadius:99, padding:'0.3rem 0.9rem', marginBottom:'1.5rem' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#86efac', display:'inline-block', animation:'pulse 2s infinite' }}/>
            <span style={{ color:'rgba(255,255,255,.9)', fontSize:'0.78rem', fontWeight:600 }}>Open to all CU students</span>
          </div>
          <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:900, color:'#fff', letterSpacing:'-1px', marginBottom:'0.8rem' }}>Ready to find what's yours?</h2>
          <p style={{ color:'rgba(255,255,255,.75)', marginBottom:'2.2rem', fontSize:'1rem', lineHeight:1.65 }}>Join hundreds of CU students already recovering their belongings through CampusFinds. Free, fast, and campus-verified.</p>
          <button onClick={onGetStarted} className="land-cta"
            style={{ background:'#fff', color:'#6366f1', border:'none', borderRadius:14, padding:'1rem 2.8rem', fontWeight:900, fontSize:'1.05rem', cursor:'pointer', transition:'all .2s', boxShadow:'0 10px 32px rgba(0,0,0,.18)' }}>
            🎓 Create Your Account — Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#0f172a', color:'rgba(255,255,255,.4)', padding:'2rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ fontWeight:900, fontSize:'1rem', color:'rgba(255,255,255,.75)', marginBottom:'0.2rem' }}>🔍 CampusFinds</div>
            <p style={{ fontSize:'0.78rem', margin:0 }}>Campus Lost &amp; Found · Chandigarh University · E1 Block, Student Care</p>
          </div>
          <p style={{ fontSize:'0.75rem', margin:0 }}>© {new Date().getFullYear()} CampusFinds. Built with ❤️ for students.</p>
        </div>
      </footer>
    </div>
  )
}
