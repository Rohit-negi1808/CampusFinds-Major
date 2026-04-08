import React from 'react';

const Footer = ({ showPage }) => (
  <footer style={{ background:'var(--surface,#fff)', borderTop:'1.5px solid var(--border,#e2e8f0)', marginTop:'auto', padding:'3rem 0 1.5rem' }}>
    <div className="container" style={{ maxWidth:1200 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'2rem', marginBottom:'2rem' }}>
        {/* Brand */}
        <div>
          <div style={{ fontSize:'1.15rem', fontWeight:900, color:'var(--text,#1e293b)', marginBottom:'0.6rem' }}>🔍 CampusFinds</div>
          <p style={{ fontSize:'0.83rem', color:'var(--text-2,#64748b)', lineHeight:1.65, margin:0 }}>
            Helping Chandigarh University students recover lost items and return found belongings. Fast, simple and community-driven.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <div style={{ fontWeight:700, color:'var(--text,#1e293b)', fontSize:'0.83rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.8rem' }}>Navigate</div>
          {[['Home','home'],['Lost Items','lostItems'],['Found Items','foundItems'],['Report Item','report'],['Contact','contact']].map(([l,p]) => (
            <a key={p} href="#" onClick={e=>{ e.preventDefault(); showPage(p); }}
              style={{ display:'block', fontSize:'0.85rem', color:'var(--text-2,#64748b)', textDecoration:'none', marginBottom:'0.35rem', transition:'color .2s' }}
              onMouseEnter={e=>e.target.style.color='#6366f1'}
              onMouseLeave={e=>e.target.style.color='var(--text-2,#64748b)'}>
              {l}
            </a>
          ))}
        </div>
        {/* Contact */}
        <div>
          <div style={{ fontWeight:700, color:'var(--text,#1e293b)', fontSize:'0.83rem', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.8rem' }}>Student Care</div>
          {[['📍 E1 Block, Room 105, North Campus'],['📞 (123) 456-7890'],['✉️ campusfinds@campus.edu'],['🕐 Mon–Sat · 10 AM – 4 PM']].map(item => (
            <p key={item} style={{ fontSize:'0.83rem', color:'var(--text-2,#64748b)', marginBottom:'0.35rem' }}>{item}</p>
          ))}
        </div>
      </div>
      <div style={{ borderTop:'1px solid var(--border,#e2e8f0)', paddingTop:'1.2rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
        <p style={{ fontSize:'0.78rem', color:'var(--text-3,#94a3b8)', margin:0 }}>© {new Date().getFullYear()} CampusFinds · Chandigarh University · Built with ❤️ for students</p>
        <span style={{ fontSize:'0.75rem', background:'#f0fdf4', color:'#15803d', padding:'0.2rem 0.7rem', borderRadius:20, fontWeight:600 }}>🟢 All systems operational</span>
      </div>
    </div>
  </footer>
);

export default Footer;
