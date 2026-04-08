import React, { useState, useRef, useEffect } from 'react';

const NAV_ITEMS = [
  { label:'Home',        page:'home'       },
  { label:'Lost Items',  page:'lostItems'  },
  { label:'Found Items', page:'foundItems' },
  { label:'Report Item', page:'report'     },
  { label:'Complaints',  page:'contact'    },
];

export default function Header({ showPage, currentPage, userName, userEmail, onLogout, darkMode, toggleDarkMode }) {
  const [showCard, setShowCard]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const cardRef = useRef(null);
  const initials = userName ? userName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = e => { if (cardRef.current && !cardRef.current.contains(e.target)) setShowCard(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const go = page => { showPage(page); setMobileOpen(false); };

  return (
    <>
      <style>{`
        .cf-pill-link{text-decoration:none;font-size:0.83rem;font-weight:500;padding:0.38rem 0.85rem;border-radius:99px;transition:all .2s;white-space:nowrap;color:#475569}
        .cf-pill-link:hover,.cf-pill-link.active{color:#6366f1;background:rgba(99,102,241,.1)}
        .cf-pill-link.active{font-weight:700}
        .cf-toggle{width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
        .cf-toggle::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .3s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
        .cf-toggle.dark{background:#6366f1}.cf-toggle.dark::after{transform:translateX(18px)}.cf-toggle:not(.dark){background:#cbd5e1}
        .cf-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:800;font-size:0.78rem;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid transparent;transition:border-color .2s}
        .cf-av:hover{border-color:#6366f1}
        @media(max-width:820px){.cf-pill-nav{display:none!important}.cf-mob-btn{display:flex!important}}
        @media(min-width:821px){.cf-mob-btn{display:none!important}}
      `}</style>

      {/* Spacer */}
      <div style={{ height:68 }}/>

      {/* Fixed pill navbar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:1000, padding:'8px 1rem' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', background:'var(--surface,#fff)', borderRadius:999,
          border:'1.5px solid var(--border,#e2e8f0)',
          boxShadow: scrolled ? '0 6px 28px rgba(0,0,0,.12)' : '0 3px 16px rgba(0,0,0,.07)',
          padding:'1rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', transition:'box-shadow .3s' }}>

          {/* Logo */}
          <a href="#" onClick={e=>{ e.preventDefault(); go('home'); }}
            style={{ display:'flex', alignItems:'center', gap:'0.45rem', textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>🔍</div>
            <span style={{ fontSize:'1rem', fontWeight:900, color:'var(--text,#1e293b)', letterSpacing:'-0.5px' }}>CampusFinds</span>
          </a>

          {/* Desktop nav links */}
          <nav className="cf-pill-nav" style={{ display:'flex', alignItems:'center', gap:'0.15rem', flex:1, justifyContent:'center' }}>
            {NAV_ITEMS.map(item => (
              <a key={item.page} href={`#${item.page}`}
                className={`cf-pill-link ${currentPage===item.page?'active':''}`}
                onClick={e=>{ e.preventDefault(); go(item.page); }}>{item.label}</a>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexShrink:0 }}>
            <button className={`cf-toggle ${darkMode?'dark':''}`} onClick={toggleDarkMode} aria-label="Toggle dark mode"/>
            <div style={{ position:'relative' }} ref={cardRef}>
              <div className="cf-av" onClick={()=>setShowCard(p=>!p)} title={userName}>{initials}</div>
              {showCard && (
                <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, background:'var(--surface,#fff)', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:14, padding:'1rem', minWidth:190, boxShadow:'0 8px 28px rgba(0,0,0,.12)', zIndex:100 }}>
                  <div style={{ marginBottom:'0.75rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border,#e2e8f0)' }}>
                    <div style={{ fontWeight:700, color:'var(--text,#1e293b)', fontSize:'0.88rem' }}>{userName}</div>
                    {userEmail && <div style={{ fontSize:'0.73rem', color:'#94a3b8', marginTop:2 }}>{userEmail}</div>}
                  </div>
                  <button onClick={()=>{ setShowCard(false); onLogout?.(); }}
                    style={{ width:'100%', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:9, padding:'0.5rem 1rem', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}
                    onMouseEnter={e=>e.target.style.background='#fca5a5'} onMouseLeave={e=>e.target.style.background='#fee2e2'}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            {/* Mobile btn */}
            <button className="cf-mob-btn" onClick={()=>setMobileOpen(p=>!p)}
              style={{ background:'none', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:9, padding:'0.35rem 0.55rem', cursor:'pointer', display:'none', flexDirection:'column', gap:4 }}>
              {[0,1,2].map(i=><span key={i} style={{ width:16, height:2, background:'var(--text,#1e293b)', display:'block', borderRadius:2 }}/>)}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{ maxWidth:1200, margin:'4px auto 0', background:'var(--surface,#fff)', borderRadius:16, border:'1.5px solid var(--border,#e2e8f0)', padding:'0.6rem 0.8rem', boxShadow:'0 8px 24px rgba(0,0,0,.1)', display:'flex', flexDirection:'column', gap:'0.2rem' }}>
            {NAV_ITEMS.map(item => (
              <a key={item.page} href={`#${item.page}`} onClick={e=>{ e.preventDefault(); go(item.page); }}
                className={`cf-pill-link ${currentPage===item.page?'active':''}`}
                style={{ display:'block', padding:'0.6rem 0.85rem' }}>{item.label}</a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
