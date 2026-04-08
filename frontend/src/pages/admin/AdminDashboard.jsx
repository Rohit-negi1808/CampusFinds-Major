import React, { useState, useEffect, useRef } from "react";
import { getStats, getRecentLostItems, getRecentFoundItems, getRecentClaims } from "../../api/adminDashboardService";

const useCounter = (target, active) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let v = 0; const step = Math.max(1, target / 60);
    const t = setInterval(() => { v += step; if (v >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(v)); }, 16);
    return () => clearInterval(t);
  }, [active, target]);
  return count;
};

const STATUS_COLORS = {
  lost:"#ef4444", found:"#10b981", returned:"#3b82f6", claimed:"#8b5cf6",
  pending:"#f59e0b", waiting:"#f59e0b", approved:"#10b981", rejected:"#ef4444",
};
const STATUS_BG = {
  lost:"#fee2e2", found:"#d1fae5", returned:"#dbeafe", claimed:"#ede9fe",
  pending:"#fef3c7", waiting:"#fef3c7", approved:"#d1fae5", rejected:"#fee2e2",
};
const STATUS_LABEL = { lost:"Lost", found:"Found", returned:"Returned", claimed:"Claimed", pending:"Pending", waiting:"Pending", approved:"Approved", rejected:"Rejected" };

const StatusPill = ({ status }) => {
  const k = status?.toLowerCase() || "";
  return <span style={{ background:STATUS_BG[k]||"#f1f5f9", color:STATUS_COLORS[k]||"#475569", padding:"0.22rem 0.75rem", borderRadius:20, fontSize:"0.72rem", fontWeight:700, whiteSpace:"nowrap" }}>{STATUS_LABEL[k]||status||"—"}</span>;
};

const StatCard = ({ icon, label, value, color, bg, onClick, active }) => {
  const count = useCounter(value, active);
  return (
    <div onClick={onClick} style={{ background:"var(--surface,#fff)", borderRadius:16, padding:"1.4rem 1.3rem", border:"1.5px solid var(--border-color,#e8ecf0)", cursor:"pointer", position:"relative", overflow:"hidden", transition:"all 0.25s ease" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${color}22`; e.currentTarget.style.borderColor=color; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; e.currentTarget.style.borderColor="var(--border-color,#e8ecf0)"; }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color, borderRadius:"16px 16px 0 0" }} />
      <div style={{ position:"absolute", bottom:-15, right:-15, width:70, height:70, borderRadius:"50%", background:color, opacity:0.06 }} />
      <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", marginBottom:"0.9rem" }}>{icon}</div>
      <div style={{ fontSize:"2.1rem", fontWeight:900, color:"var(--text,#1e293b)", lineHeight:1, letterSpacing:"-1px" }}>{count}</div>
      <div style={{ fontSize:"0.73rem", color:"var(--text-2,#475569)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:5 }}>{label}</div>
    </div>
  );
};

const QuickBtn = ({ icon, label, onClick, color, badge }) => (
  <div onClick={onClick} style={{ background:"var(--surface,#fff)", borderRadius:14, border:"1.5px solid var(--border-color,#e8ecf0)", padding:"1.1rem 0.9rem", cursor:"pointer", textAlign:"center", position:"relative", transition:"all 0.22s" }}
    onMouseEnter={e=>{ e.currentTarget.style.borderColor=color; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${color}22`; }}
    onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border-color,#e8ecf0)"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
    {badge > 0 && <span style={{ position:"absolute", top:-7, right:-7, background:color, color:"#fff", width:20, height:20, borderRadius:"50%", fontSize:"0.68rem", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{badge}</span>}
    <div style={{ fontSize:"1.6rem", marginBottom:"0.4rem" }}>{icon}</div>
    <div style={{ fontSize:"0.77rem", fontWeight:700, color:"var(--text-2,#475569)", lineHeight:1.2 }}>{label}</div>
  </div>
);

const FeedCard = ({ title, icon, items, empty, renderRow, onAll, accent }) => (
  <div style={{ background:"var(--surface,#fff)", borderRadius:16, border:"1.5px solid var(--border-color,#e8ecf0)", overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,.05)" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.1rem 1.4rem", borderBottom:"1.5px solid var(--border-color,#e8ecf0)" }}>
      <span style={{ fontWeight:800, color:"var(--text,#1e293b)", display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.95rem" }}>{icon} {title}</span>
      <button onClick={onAll} style={{ background:"none", border:"none", color:accent, fontWeight:700, fontSize:"0.8rem", cursor:"pointer" }}>View All →</button>
    </div>
    {items.length === 0
      ? <div style={{ padding:"2.5rem", textAlign:"center", color:"#94a3b8" }}><div style={{ fontSize:"2.2rem", marginBottom:"0.4rem", opacity:.35 }}>📭</div><p style={{ margin:0, fontSize:"0.85rem" }}>{empty}</p></div>
      : <ul style={{ listStyle:"none", margin:0, padding:0 }}>
          {items.map((item,i) => (
            <li key={item._id||i} style={{ display:"flex", alignItems:"center", gap:"0.9rem", padding:"0.8rem 1.4rem", borderBottom:i<items.length-1?"1px solid var(--border-color,#e8ecf0)":"none", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="var(--hover-bg,#f8f9fa)"}
              onMouseLeave={e=>{ e.currentTarget.style.background=''; }}>
              {renderRow(item)}
            </li>
          ))}
        </ul>
    }
  </div>
);

export default function AdminDashboard({ showPage }) {
  const [stats, setStats]             = useState({ totalItems:0, lost:0, found:0, totalClaims:0, pendingClaims:0, users:0, totalContacts:0, pendingFeedbacks:0 });
  const [recentItems, setRecentItems] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [now]                         = useState(new Date());
  const [active, setActive]           = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold:0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, [loading]);

  useEffect(() => {
    (async () => {
      try {
        const s = await getStats();
        setStats({ totalItems:(s.totalLost||0)+(s.totalFound||0), lost:s.totalLost||0, found:s.totalFound||0, totalClaims:s.totalClaims||0, pendingClaims:s.pendingClaims||0, users:s.totalUsers||0, totalContacts:s.totalContacts||0, pendingFeedbacks:s.pendingFeedbacks||0 });
        const [lost, found, claims] = await Promise.all([getRecentLostItems(), getRecentFoundItems(), getRecentClaims()]);
        setRecentItems([...lost.map(i=>({...i,_type:"lost"})), ...found.map(i=>({...i,_type:"found"}))].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,8));
        setRecentClaims(claims.slice(0,8));
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const greet = () => { const h = now.getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };
  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—";
  const getImgSrc = url => !url ? null : (url.startsWith("data:")||url.startsWith("http")) ? url : url;

  const STATS = [
    { key:"totalItems",      icon:"📦", label:"Total Items",     color:"#6366f1", bg:"#ede9fe", page:"lostItems"  },
    { key:"lost",            icon:"🔴", label:"Lost Reports",    color:"#ef4444", bg:"#fee2e2", page:"lostItems"  },
    { key:"found",           icon:"🟢", label:"Found Items",     color:"#10b981", bg:"#d1fae5", page:"foundItems" },
    { key:"users",           icon:"👥", label:"Students",        color:"#3b82f6", bg:"#dbeafe", page:"users"      },
    { key:"pendingClaims",   icon:"⏳", label:"Pending Claims",  color:"#f59e0b", bg:"#fef3c7", page:"claims"     },
    { key:"totalClaims",     icon:"📋", label:"Total Claims",    color:"#8b5cf6", bg:"#ede9fe", page:"claims"     },
    { key:"totalContacts",   icon:"💬", label:"Feedback",        color:"#06b6d4", bg:"#cffafe", page:"feedback"   },
    { key:"pendingFeedbacks",icon:"🔔", label:"Unresolved",      color:"#f97316", bg:"#ffedd5", page:"feedback"   },
  ];

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh", flexDirection:"column", gap:"1rem" }}>
      <div style={{ width:44, height:44, border:"4px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:"#94a3b8", fontWeight:600 }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div style={{ background:"var(--bg,#f4f6fb)", minHeight:"100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}`}</style>

      {/* ── Hero Banner ── */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#4338ca 70%,#6366f1 100%)", padding:"2.5rem 0 4.5rem", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-30%", right:"-3%", width:340, height:340, borderRadius:"50%", background:"rgba(129,140,248,.22)", filter:"blur(70px)" }}/>
        <div style={{ position:"absolute", top:"20%", left:"12%", width:180, height:180, borderRadius:"50%", background:"rgba(245,158,11,.14)", filter:"blur(50px)" }}/>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", position:"relative", zIndex:2, display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"rgba(255,255,255,.15)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.25)", borderRadius:50, padding:"0.3rem 1rem", marginBottom:"1rem" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#86efac", display:"inline-block", animation:"pulse 2s ease infinite", boxShadow:"0 0 8px #86efac" }}/>
              <span style={{ color:"rgba(255,255,255,.9)", fontSize:"0.78rem", fontWeight:600 }}>System Online · Admin Control Center</span>
            </div>
            <h1 style={{ fontSize:"2.3rem", fontWeight:900, color:"#fff", letterSpacing:"-1px", marginBottom:"0.3rem", lineHeight:1.1 }}>{greet()}, Admin 👋</h1>
            <p style={{ color:"rgba(255,255,255,.65)", margin:0, fontSize:"0.92rem" }}>{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · CampusFinds v4</p>
          </div>
          {(stats.pendingClaims > 0 || stats.pendingFeedbacks > 0) && (
            <div style={{ background:"rgba(245,158,11,.18)", backdropFilter:"blur(8px)", border:"1px solid rgba(245,158,11,.4)", borderRadius:14, padding:"0.9rem 1.3rem", color:"#fff" }}>
              <div style={{ fontSize:"0.72rem", fontWeight:800, textTransform:"uppercase", color:"#fbbf24", marginBottom:"0.4rem", letterSpacing:"0.06em" }}>⚡ Needs Attention</div>
              {stats.pendingClaims > 0 && <div style={{ fontSize:"0.85rem", marginBottom:"0.2rem" }}>📋 <strong>{stats.pendingClaims}</strong> claim{stats.pendingClaims>1?"s":""} pending</div>}
              {stats.pendingFeedbacks > 0 && <div style={{ fontSize:"0.85rem" }}>💬 <strong>{stats.pendingFeedbacks}</strong> feedback unresolved</div>}
            </div>
          )}
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0 }}>
          <svg viewBox="0 0 1440 56" fill="none" style={{ display:"block" }}><path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="var(--bg,#f4f6fb)"/></svg>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem 4rem" }}>

        {/* ── Stats ── */}
        <div ref={statsRef} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))", gap:"1rem", marginBottom:"2rem", marginTop:"-0.5rem" }}>
          {STATS.map((s,i) => (
            <div key={s.key} style={{ animation:`fadeUp 0.45s ease ${i*0.07}s both` }}>
              <StatCard icon={s.icon} label={s.label} value={stats[s.key]||0} color={s.color} bg={s.bg} active={active} onClick={()=>showPage(s.page)}/>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.85rem" }}>
          <h3 style={{ fontWeight:800, color:"var(--text,#1e293b)", fontSize:"1rem", margin:0 }}>⚡ Quick Actions</h3>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))", gap:"0.75rem", marginBottom:"2.5rem" }}>
          <QuickBtn icon="📝" label="Lost Items"  onClick={()=>showPage("lostItems")}  color="#ef4444" badge={0}/>
          <QuickBtn icon="✅" label="Found Items" onClick={()=>showPage("foundItems")} color="#10b981" badge={0}/>
          <QuickBtn icon="📋" label="Claims"      onClick={()=>showPage("claims")}     color="#f59e0b" badge={stats.pendingClaims}/>
          <QuickBtn icon="👥" label="Users"       onClick={()=>showPage("users")}      color="#3b82f6" badge={0}/>
          <QuickBtn icon="💬" label="Feedback"    onClick={()=>showPage("feedback")}   color="#8b5cf6" badge={stats.pendingFeedbacks}/>
          <QuickBtn icon="📊" label="Analytics"   onClick={()=>showPage("analytics")}  color="#06b6d4" badge={0}/>
          <QuickBtn icon="🏷️" label="QR Labels"  onClick={()=>showPage("qrLabels")}   color="#10b981" badge={0}/>
          <QuickBtn icon="⚙️" label="Settings"   onClick={()=>showPage("settings")}   color="#6366f1" badge={0}/>
        </div>

        {/* ── Activity ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.9rem" }}>
          <h3 style={{ fontWeight:800, color:"var(--text,#1e293b)", fontSize:"1rem", margin:0 }}>📡 Recent Activity</h3>
          <span style={{ fontSize:"0.78rem", color:"var(--text-3,#94a3b8)", background:"var(--surface,#fff)", border:"1px solid var(--border-color,#e8ecf0)", borderRadius:8, padding:"0.25rem 0.7rem" }}>Live data</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1.4rem" }}>

          <FeedCard title="Recent Item Reports" icon="📦" accent="#6366f1"
            items={recentItems} empty="No recent item reports." onAll={()=>showPage("lostItems")}
            renderRow={item => {
              const src = getImgSrc(item.imageUrl);
              return <>
                {src
                  ? <img src={src} alt="" style={{ width:40, height:40, borderRadius:8, objectFit:"cover", flexShrink:0, border:"1.5px solid #e8ecf0" }}/>
                  : <div style={{ width:40, height:40, borderRadius:8, background:item._type==="lost"?"#fee2e2":"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>{item._type==="lost"?"🔴":"🟢"}</div>
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:"0.87rem", color:"var(--text,#1e293b)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</div>
                  <div style={{ fontSize:"0.74rem", color:"var(--text-3,#94a3b8)", marginTop:2 }}>📍 {item.location||"—"} · {fmtDate(item.createdAt)}</div>
                </div>
                <StatusPill status={item.status||item._type}/>
              </>;
            }}
          />

          <FeedCard title="Recent Claims" icon="📋" accent="#f59e0b"
            items={recentClaims} empty="No recent claims." onAll={()=>showPage("claims")}
            renderRow={claim => <>
              <div style={{ width:40, height:40, borderRadius:8, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>📋</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:"0.87rem", color:"var(--text,#1e293b)" }}>Claim #{claim._id?.slice(-5)}</div>
                <div style={{ fontSize:"0.74rem", color:"var(--text-3,#94a3b8)", marginTop:2 }}>By {claim.claimantName} · {fmtDate(claim.createdAt)}</div>
              </div>
              <StatusPill status={claim.status}/>
            </>}
          />

        </div>

        {/* ── System Health ── */}
        <div style={{ marginTop:"2rem", background:"var(--surface,#fff)", borderRadius:16, border:"1.5px solid var(--border-color,#e8ecf0)", padding:"1.1rem 1.5rem", display:"flex", gap:"2rem", flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ fontWeight:800, fontSize:"0.85rem", color:"var(--text,#1e293b)" }}>🔧 System Status</div>
          {["Database","API Server","Feedback Service","File Storage"].map(label => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", display:"inline-block", boxShadow:"0 0 6px #10b981" }}/>
              <span style={{ fontSize:"0.79rem", color:"var(--text-2,#475569)", fontWeight:600 }}>{label}</span>
            </div>
          ))}
          <span style={{ marginLeft:"auto", fontSize:"0.77rem", color:"#94a3b8" }}>Chandigarh University · CampusFinds</span>
        </div>

      </div>
    </div>
  );
}
