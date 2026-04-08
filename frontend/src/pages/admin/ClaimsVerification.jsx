import React, { useState, useEffect, useMemo } from "react";
import { getClaims, updateClaim, getLostItems, getFoundItems } from "../../api/adminService.js";

const SBadge = ({ status }) => {
  const M = { waiting:{bg:"#fef3c7",c:"#92400e",l:"⏳ Pending"}, pending:{bg:"#fef3c7",c:"#92400e",l:"⏳ Pending"}, approved:{bg:"#d1fae5",c:"#065f46",l:"✅ Approved"}, rejected:{bg:"#fee2e2",c:"#991b1b",l:"❌ Rejected"} };
  const s = M[status?.toLowerCase()] || {bg:"#f1f5f9",c:"#475569",l:status||"—"};
  return <span style={{background:s.bg,color:s.c,padding:"0.25rem 0.7rem",borderRadius:20,fontSize:"0.72rem",fontWeight:700,whiteSpace:"nowrap"}}>{s.l}</span>;
};

const TypeBadge = ({ type }) => {
  const isLost = type === "lost";
  return <span style={{ background:isLost?"#fee2e2":"#d1fae5", color:isLost?"#991b1b":"#065f46", padding:"0.2rem 0.6rem", borderRadius:20, fontSize:"0.7rem", fontWeight:700 }}>{isLost?"🔴 Lost":"🟢 Found"}</span>;
};

const Modal = ({ open, onClose, title, children }) => open ? (
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(4px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface,#fff)",borderRadius:18,maxWidth:600,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.2)",maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.5rem 1.5rem 0"}}>
        <h4 style={{fontWeight:800,color:"var(--text,#1e293b)",margin:0,fontSize:"1.05rem"}}>{title}</h4>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.5rem",cursor:"pointer",color:"var(--text-2,#475569)",lineHeight:1}}>×</button>
      </div>
      <div style={{padding:"1.2rem 1.5rem 1.5rem"}}>{children}</div>
    </div>
  </div>
) : null;

export default function ClaimsVerification({ toast }) {
  const [claims, setClaims]   = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [note, setNote]         = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [claimsData, lost, found] = await Promise.all([getClaims(), getLostItems(), getFoundItems()]);
        setClaims(Array.isArray(claimsData) ? claimsData : []);
        setAllItems([...(lost||[]).map(i=>({...i,_itemType:"lost"})), ...(found||[]).map(i=>({...i,_itemType:"found"}))]);
      } catch { toast?.error("Failed to load"); }
      finally { setLoading(false); }
    })();
  }, []);

  const getItem = id => allItems.find(it => it._id === id);
  const getImgSrc = url => !url ? null : url;

  const filtered = useMemo(() => claims
    .filter(c => filter === "all" || c.status?.toLowerCase() === filter || (filter==="pending" && c.status?.toLowerCase()==="waiting"))
    .filter(c => [c.claimantName,c.claimantEmail,c.message||""].join(" ").toLowerCase().includes(search.toLowerCase())),
  [claims, search, filter]);

  const pending = claims.filter(c => ["pending","waiting"].includes(c.status?.toLowerCase())).length;

  const doUpdate = async (id, status, adminNote) => {
    setUpdating(true);
    try {
      const updatedClaim = await updateClaim(id, { status, adminNote });
      const claimRecord = claims.find(c => c._id === id);

      // Update this claim's status
      setClaims(p => p.map(c => {
        if (c._id === id) return { ...c, status, adminNote };
        // If approving, auto-reject all other pending claims for the same item in UI
        if (status === 'approved' && c.itemId === claimRecord?.itemId && ['waiting','pending'].includes(c.status?.toLowerCase())) {
          return { ...c, status: 'rejected', adminNote: 'Auto-rejected: Another claim for this item was approved.' };
        }
        return c;
      }));

      // AUTO-REFLECT found item status in UI
      if (claimRecord?.itemType !== 'lost') {
        if (status === 'approved') {
          setAllItems(prev => prev.map(it =>
            it._id === claimRecord?.itemId ? { ...it, status: 'claimed' } : it
          ));
        }
        if (status === 'rejected') {
          const hasOtherApproved = claims.some(c => c._id !== id && c.itemId === claimRecord?.itemId && c.status === 'approved');
          if (!hasOtherApproved) {
            setAllItems(prev => prev.map(it =>
              it._id === claimRecord?.itemId ? { ...it, status: 'found' } : it
            ));
          }
        }
      }

      toast?.success(`Claim ${status}`);
      setSelected(null); setNote("");
    } catch { toast?.error("Update failed"); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"60vh"}}><div style={{width:44,height:44,border:"4px solid #e2e8f0",borderTopColor:"#f59e0b",borderRadius:"50%",animation:"spin .8s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{background:"var(--bg,#f8fafc)",minHeight:"100vh"}}>
      {/* Banner */}
      <div style={{background:"linear-gradient(135deg,#78350f 0%,#92400e 40%,#b45309 70%,#f59e0b 100%)",color:"#fff",padding:"3rem 0 4.5rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"-20%",right:"-5%",width:280,height:280,borderRadius:"50%",background:"rgba(245,158,11,.15)",filter:"blur(60px)"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 1.5rem",position:"relative",zIndex:2}}>
          <div style={{fontSize:"2.8rem",marginBottom:"0.5rem"}}>📋</div>
          <h1 style={{fontSize:"2.2rem",fontWeight:900,letterSpacing:"-1px",marginBottom:"0.3rem"}}>Claims & Verification</h1>
          <p style={{color:"rgba(255,255,255,.65)",margin:0}}>{claims.length} total · <strong style={{color:"#fde68a"}}>{pending} pending review</strong></p>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0}}>
          <svg viewBox="0 0 1440 48" fill="none" style={{display:"block"}}><path d="M0,32 C360,0 1080,48 1440,12 L1440,48 L0,48 Z" fill="#f8fafc"/></svg>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"1.5rem"}}>
        <div style={{display:"flex",gap:"0.8rem",marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"}}>
          <div style={{flex:1,minWidth:220,position:"relative"}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…"
              style={{width:"100%",padding:"0.65rem 1rem 0.65rem 2.5rem",borderRadius:10,border:"1.5px solid var(--border,#e2e8f0)",background:"var(--surface,#fff)",color:"var(--text,#1e293b)",fontSize:"0.9rem",outline:"none"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1.5rem"}}>
          {[{l:"All",v:"all"},{l:"⏳ Pending",v:"pending"},{l:"✅ Approved",v:"approved"},{l:"❌ Rejected",v:"rejected"}].map(c => (
            <button key={c.v} onClick={()=>setFilter(c.v)} style={{padding:"0.4rem 1rem",borderRadius:20,border:"1.5px solid",fontWeight:600,fontSize:"0.82rem",cursor:"pointer",transition:"all .2s",
              background:filter===c.v?"linear-gradient(135deg,#f59e0b,#d97706)":"var(--surface,#fff)",
              color:filter===c.v?"#fff":"var(--text-2,#475569)",borderColor:filter===c.v?"#f59e0b":"var(--border,#e2e8f0)"}}>{c.l}</button>
          ))}
          <span style={{marginLeft:"auto",color:"var(--text-2,#475569)",fontSize:"0.85rem",fontWeight:600,alignSelf:"center"}}>{filtered.length} claims</span>
        </div>

        {/* Clickable cards */}
        <div style={{display:"grid",gap:"0.8rem"}}>
          {filtered.length === 0 ? (
            <div style={{background:"var(--surface,#fff)",borderRadius:14,padding:"3rem",textAlign:"center",color:"var(--text-2,#475569)",border:"1.5px solid var(--border,#e2e8f0)"}}>No claims found</div>
          ) : filtered.map(claim => {
            const item = getItem(claim.itemId);
            const imgSrc = item ? getImgSrc(item.imageUrl) : null;
            const isNew = ["pending","waiting"].includes(claim.status?.toLowerCase());
            return (
              <div key={claim._id} onClick={()=>{ setSelected(claim); setNote(""); }}
                style={{background:"var(--surface,#fff)",borderRadius:14,padding:"1rem 1.2rem",border:"1.5px solid var(--border,#e2e8f0)",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="#f59e0b"; e.currentTarget.style.boxShadow="0 6px 20px rgba(245,158,11,.12)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border,#e2e8f0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.04)"; }}>
                {/* Item image */}
                <div style={{flexShrink:0}}>
                  {imgSrc
                    ? <img src={imgSrc} alt="" style={{width:52,height:52,borderRadius:10,objectFit:"contain",border:"1.5px solid var(--border,#e2e8f0)",background:"#f8fafc",padding:3}}/>
                    : <div style={{width:52,height:52,borderRadius:10,background:item?._itemType==="lost"?"#fee2e2":"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{item?._itemType==="lost"?"🔴":"🟢"}</div>}
                </div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.25rem"}}>
                    <span style={{fontWeight:700,fontSize:"0.9rem",color:"var(--text,#1e293b)"}}>{item?.title||`Item #${claim.itemId?.slice(-4)}`}</span>
                    {item && <TypeBadge type={item._itemType}/>}
                  </div>
                  <div style={{fontSize:"0.8rem",color:"var(--text-2,#475569)"}}>
                    <strong>{claim.claimantName}</strong> · {claim.claimantEmail||claim.contact||"—"}
                  </div>
                  {claim.message && <div style={{fontSize:"0.78rem",color:"var(--text-3,#94a3b8)",marginTop:"0.2rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:400}}>{claim.message}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.4rem",flexShrink:0}}>
                  <SBadge status={claim.status}/>
                  <span style={{fontSize:"0.72rem",color:"var(--text-3,#94a3b8)"}}>{claim.createdAt?new Date(claim.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}):"—"}</span>
                </div>
                {isNew && <div style={{position:"absolute",top:8,right:8,width:8,height:8,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 6px #f59e0b"}}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={()=>{ setSelected(null); setNote(""); }} title="📋 Claim Details">
        {selected && (() => {
          const item = getItem(selected.itemId);
          const imgSrc = item ? getImgSrc(item.imageUrl) : null;
          const isPending = ["pending","waiting"].includes(selected.status?.toLowerCase());
          // Block approve/reject if another claim for this item is already approved
          const isBlocked = !isPending || claims.some(
            c => c._id !== selected._id &&
                 c.itemId === selected.itemId &&
                 c.status === 'approved'
          );
          return (
            <>
              {/* Item preview */}
              <div style={{display:"flex",alignItems:"center",gap:"1rem",background:"var(--bg,#f8fafc)",borderRadius:14,padding:"1rem",marginBottom:"1.2rem",border:"1.5px solid var(--border,#e2e8f0)"}}>
                {imgSrc
                  ? <img src={imgSrc} alt="" style={{width:64,height:64,borderRadius:10,objectFit:"contain",border:"1.5px solid var(--border,#e2e8f0)",background:"#fff",padding:4,flexShrink:0}}/>
                  : <div style={{width:64,height:64,borderRadius:10,background:item?._itemType==="lost"?"#fee2e2":"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",flexShrink:0}}>{item?._itemType==="lost"?"🔴":"🟢"}</div>}
                <div>
                  <div style={{fontWeight:700,color:"var(--text,#1e293b)",fontSize:"0.95rem"}}>{item?.title||`Item #${selected.itemId?.slice(-4)}`}</div>
                  {item && <TypeBadge type={item._itemType}/>}
                  {item?.location && <div style={{fontSize:"0.78rem",color:"var(--text-3,#94a3b8)",marginTop:"0.2rem"}}>📍 {item.location}</div>}
                </div>
              </div>
              {/* Claimant info */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem",marginBottom:"1rem"}}>
                {[["Claimant",selected.claimantName],["Email",selected.claimantEmail],["Phone",selected.contact],["Submitted",selected.createdAt?new Date(selected.createdAt).toLocaleString():"—"]].map(([l,v])=>v?(
                  <div key={l} style={{background:"var(--bg,#f8fafc)",borderRadius:10,padding:"0.7rem 0.9rem",border:"1px solid var(--border,#e2e8f0)"}}>
                    <div style={{fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-3,#94a3b8)",marginBottom:"0.2rem"}}>{l}</div>
                    <div style={{fontSize:"0.88rem",color:"var(--text,#1e293b)",fontWeight:600}}>{v}</div>
                  </div>
                ):null)}
              </div>
              {selected.message && (
                <div style={{background:"var(--bg,#f8fafc)",borderRadius:10,padding:"0.9rem",marginBottom:"1rem",border:"1px solid var(--border,#e2e8f0)"}}>
                  <div style={{fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",color:"var(--text-3,#94a3b8)",marginBottom:"0.4rem"}}>Claim Message</div>
                  <p style={{color:"var(--text,#1e293b)",fontSize:"0.9rem",lineHeight:1.6,margin:0}}>{selected.message}</p>
                </div>
              )}
              <div style={{marginBottom:"1.2rem"}}><SBadge status={selected.status}/></div>
              {isPending && (
                <div>
                  <label style={{fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",color:"#94a3b8",display:"block",marginBottom:"0.4rem"}}>Admin Note (optional)</label>
                  <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note for the student…"
                    style={{width:"100%",padding:"0.65rem 0.9rem",borderRadius:9,border:"1.5px solid var(--border,#e2e8f0)",background:"var(--surface,#fff)",color:"var(--text,#1e293b)",fontSize:"0.88rem",outline:"none",resize:"vertical",fontFamily:"inherit",marginBottom:"0.8rem"}}/>
                  {isBlocked ? (
                    <div style={{background:"#fef3c7",border:"1.5px solid #f59e0b",borderRadius:10,padding:"0.85rem 1rem",textAlign:"center",color:"#92400e",fontWeight:600,fontSize:"0.88rem"}}>
                      🔒 Another claim for this item is already approved. This claim is auto-rejected.
                    </div>
                  ) : (
                    <div style={{display:"flex",gap:"0.8rem"}}>
                      <button onClick={()=>doUpdate(selected._id,"approved",note)} disabled={updating} style={{flex:1,padding:"0.75rem",borderRadius:10,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.95rem"}}>
                        {updating?"…":"✅ Approve"}
                      </button>
                      <button onClick={()=>doUpdate(selected._id,"rejected",note)} disabled={updating} style={{flex:1,padding:"0.75rem",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.95rem"}}>
                        {updating?"…":"❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </Modal>
    </div>
  );
}