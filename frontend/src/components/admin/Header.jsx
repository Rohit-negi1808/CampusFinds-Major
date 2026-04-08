import React, { useState, useRef, useEffect } from 'react'

const NAV = [
  { id:'dashboard',  label:'Dashboard',             icon:'📊' },
  { id:'lostItems',  label:'Lost Items',             icon:'🔴' },
  { id:'foundItems', label:'Found Items',            icon:'🟢' },
  { id:'claims',     label:'Claims',                 icon:'📋' },
  { id:'users',      label:'Users',                  icon:'👥' },
  { id:'feedback',   label:'Feedback & Complaints',  icon:'💬' },
  { id:'analytics',  label:'Analytics',              icon:'📈' },
  { id:'settings',   label:'Settings',               icon:'⚙️'  },
]

export default function AdminHeader({ currentPage, showPage, adminName, adminEmail, onLogout, darkMode, toggleDarkMode }) {
  const [showCard, setShowCard] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cardRef = useRef(null)
  const initials = adminName?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'SA'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = e => { if (cardRef.current && !cardRef.current.contains(e.target)) setShowCard(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const go = id => { showPage(id) }

  return (
    <>
      <style>{`
        .adm-pill{text-decoration:none;font-size:0.81rem;font-weight:600;padding:1rem 1rem;border-radius:99px;transition:all .2s;white-space:nowrap;display:inline-flex;align-items:center;gap:0.3rem;color:#475569}
        .adm-pill:hover,.adm-pill.active{color:#6366f1;background:rgba(99,102,241,.1)}
        .adm-pill.active{font-weight:700}
        .adm-nav-scroll{display:flex;align-items:center;gap:0.15rem;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
        .adm-nav-scroll::-webkit-scrollbar{display:none}
        .adm-toggle{width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
        .adm-toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .3s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
        .adm-toggle.dark{background:#6366f1}.adm-toggle.dark::after{transform:translateX(18px)}.adm-toggle:not(.dark){background:#cbd5e1}
      `}</style>

      {/* Spacer */}
      <div style={{ height:68 }}/>

      {/* Fixed pill container */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000, padding:'8px 1rem' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', background:'var(--surface,#fff)', borderRadius:999,
          border:'1.5px solid var(--border,#e2e8f0)',
          boxShadow: scrolled ? '0 6px 28px rgba(0,0,0,.12)' : '0 3px 16px rgba(0,0,0,.07)',
          padding:'0.4rem 1rem', display:'flex', alignItems:'center', gap:'0.75rem', transition:'box-shadow .3s' }}>

          {/* Logo */}
          <a href="#" onClick={e=>{ e.preventDefault(); go('dashboard'); }}
            style={{ display:'flex', alignItems:'center', gap:'0.45rem', textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>🛡️</div>
            <span style={{ fontSize:'1rem', fontWeight:900, color:'var(--text,#1e293b)', letterSpacing:'-0.5px' }}>Admin</span>
          </a>

          {/* Scrollable nav */}
          <nav className="adm-nav-scroll" style={{ flex:1 }}>
            {NAV.map(item => (
              <a key={item.id} href={`#${item.id}`}
                className={`adm-pill ${currentPage===item.id?'active':''}`}
                onClick={e=>{ e.preventDefault(); go(item.id); }}>
                {item.icon} {item.label}
              </a>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexShrink:0 }}>
            <button className={`adm-toggle ${darkMode?'dark':''}`} onClick={toggleDarkMode} aria-label="Toggle dark mode"/>
            <div style={{ position:'relative' }} ref={cardRef}>
              <button onClick={()=>setShowCard(p=>!p)}
                style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'none', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:99, padding:'0.25rem 0.6rem 0.25rem 0.3rem', cursor:'pointer', transition:'border-color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border,#e2e8f0)'}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'0.7rem' }}>{initials}</div>
                <span style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text,#1e293b)' }}>{adminName?.split(' ')[0]}</span>
              </button>
              {showCard && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--surface,#fff)', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:14, padding:'1rem', minWidth:190, boxShadow:'0 8px 28px rgba(0,0,0,.12)', zIndex:100 }}>
                  <div style={{ marginBottom:'0.75rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border,#e2e8f0)' }}>
                    <div style={{ fontWeight:700, color:'var(--text,#1e293b)', fontSize:'0.88rem' }}>{adminName}</div>
                    {adminEmail && <div style={{ fontSize:'0.73rem', color:'#94a3b8', marginTop:2 }}>{adminEmail}</div>}
                    <span style={{ display:'inline-block', marginTop:'0.35rem', background:'#fef3c7', color:'#92400e', padding:'0.15rem 0.6rem', borderRadius:20, fontSize:'0.68rem', fontWeight:700 }}>🛡️ Administrator</span>
                  </div>
                  <button onClick={()=>{ setShowCard(false); onLogout?.() }}
                    style={{ width:'100%', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:9, padding:'0.5rem 1rem', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}
                    onMouseEnter={e=>e.target.style.background='#fca5a5'} onMouseLeave={e=>e.target.style.background='#fee2e2'}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
