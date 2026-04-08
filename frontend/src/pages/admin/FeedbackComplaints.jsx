import React, { useState, useEffect, useMemo } from 'react'

const SBadge = ({ s }) => {
  const M = { resolved:{bg:'#dbeafe',c:'#1e40af',t:'✅ Resolved'}, pending:{bg:'#fef3c7',c:'#92400e',t:'⏳ Pending'} }
  const x = M[s] || M.pending
  return <span style={{background:x.bg,color:x.c,padding:'0.22rem 0.7rem',borderRadius:20,fontSize:'0.72rem',fontWeight:700,whiteSpace:'nowrap'}}>{x.t}</span>
}
const Stars = ({ n }) => <span>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=n?'#f59e0b':'#e2e8f0',fontSize:'0.95rem'}}>★</span>)}</span>

const Modal = ({ open, onClose, children }) => open ? (
  <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
    <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface,#fff)',borderRadius:18,maxWidth:580,width:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
      {children}
    </div>
  </div>
) : null

export default function FeedbackComplaints({ toast }) {
  const [tab, setTab]           = useState('complaints')
  const [complaints, setComplaints] = useState([])
  const [feedbacks, setFeedbacks]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [reply, setReply]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [cRes, fRes] = await Promise.all([fetch('/api/contact'), fetch('/api/feedback')])
        if (cRes.ok) setComplaints(await cRes.json())
        if (fRes.ok) setFeedbacks(await fRes.json())
      } catch { toast?.error('Failed to load') }
      finally { setLoading(false) }
    })()
  }, [])

  const filteredComplaints = useMemo(() => complaints
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => [c.name,c.email,c.subject,c.message].join(' ').toLowerCase().includes(search.toLowerCase()))
  , [complaints, filter, search])

  const filteredFeedback = useMemo(() => feedbacks
    .filter(f => filter === 'all' || (filter === 'visible' ? f.visible : !f.visible))
    .filter(f => [f.name,f.email,f.message,f.itemRecovered||''].join(' ').toLowerCase().includes(search.toLowerCase()))
  , [feedbacks, filter, search])

  const resolveComplaint = async (id, adminReply) => {
    setSaving(true)
    try {
      const r = await fetch(`/api/contact/${id}/resolve`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ adminReply }) })
      if (!r.ok) throw new Error()
      const updated = await r.json()
      setComplaints(p => p.map(c => c._id===id ? updated : c))
      toast?.success('Marked as resolved'); setSelected(null); setReply('')
    } catch { toast?.error('Failed to resolve') }
    finally { setSaving(false) }
  }

  const deleteFeedback = async (id) => {
    if (!confirm('Delete this feedback?')) return
    try {
      await fetch(`/api/feedback/${id}`, { method:'DELETE' })
      setFeedbacks(p => p.filter(f => f._id !== id))
      toast?.success('Deleted')
    } catch { toast?.error('Delete failed') }
  }

  const toggleFeedback = async (id) => {
    try {
      const r = await fetch(`/api/feedback/${id}/toggle`, { method:'PATCH' })
      if (!r.ok) throw new Error()
      const updated = await r.json()
      setFeedbacks(p => p.map(f => f._id===id ? updated : f))
      toast?.success(updated.visible ? 'Now visible on site' : 'Hidden from site')
    } catch { toast?.error('Failed') }
  }

  const pendingCount   = complaints.filter(c => c.status === 'pending').length
  const avgRating      = feedbacks.length ? (feedbacks.reduce((s,f)=>s+f.rating,0)/feedbacks.length).toFixed(1) : '—'
  const visibleCount   = feedbacks.filter(f => f.visible).length

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><div style={{width:44,height:44,border:'4px solid #e2e8f0',borderTopColor:'#8b5cf6',borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{background:'var(--bg,#f8fafc)',minHeight:'100vh'}}>
      {/* Banner */}
      <div style={{background:'linear-gradient(135deg,#1e1b4b 0%,#4c1d95 50%,#7c3aed 100%)',color:'#fff',padding:'3rem 0 4.5rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-20%',right:'-5%',width:280,height:280,borderRadius:'50%',background:'rgba(139,92,246,.2)',filter:'blur(60px)'}}/>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 1.5rem',position:'relative',zIndex:2}}>
          <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>💬</div>
          <h1 style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:'-1px',marginBottom:'0.8rem'}}>Feedback & Complaints</h1>
          <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap'}}>
            {[['📋 Complaints',complaints.length],['⏳ Pending',pendingCount],['⭐ Avg Rating',avgRating],['👁️ Visible Stories',visibleCount]].map(([l,v])=>(
              <div key={l} style={{textAlign:'center'}}>
                <div style={{fontSize:'1.6rem',fontWeight:900,lineHeight:1}}>{v}</div>
                <div style={{fontSize:'0.72rem',opacity:.7,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0}}><svg viewBox="0 0 1440 48" fill="none" style={{display:'block'}}><path d="M0,32 C360,0 1080,48 1440,12 L1440,48 L0,48 Z" fill="#f8fafc"/></svg></div>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'1.5rem'}}>
        {/* Tabs */}
        <div style={{display:'flex',gap:'0.4rem',marginBottom:'1.5rem',background:'var(--surface,#fff)',padding:'0.3rem',borderRadius:12,border:'1.5px solid var(--border,#e2e8f0)',width:'fit-content'}}>
          {[{id:'complaints',l:`📋 Complaints (${complaints.length})`},{id:'feedback',l:`⭐ Student Feedback (${feedbacks.length})`}].map(t=>(
            <button key={t.id} onClick={()=>{ setTab(t.id); setFilter('all'); setSearch(''); }} style={{padding:'0.5rem 1.2rem',borderRadius:9,border:'none',cursor:'pointer',fontWeight:600,fontSize:'0.83rem',transition:'all .2s',whiteSpace:'nowrap',
              background:tab===t.id?'linear-gradient(135deg,#7c3aed,#6d28d9)':'transparent',
              color:tab===t.id?'#fff':'var(--text-2,#64748b)'}}>{t.l}</button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{display:'flex',gap:'0.8rem',marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
          <div style={{flex:1,minWidth:200,position:'relative'}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)'}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{width:'100%',padding:'0.65rem 1rem 0.65rem 2.5rem',borderRadius:10,border:'1.5px solid var(--border,#e2e8f0)',background:'var(--surface,#fff)',color:'var(--text,#1e293b)',fontSize:'0.9rem',outline:'none'}}/>
          </div>
          <div style={{display:'flex',gap:'0.4rem'}}>
            {(tab==='complaints'
              ? [{l:'All',v:'all'},{l:'⏳ Pending',v:'pending'},{l:'✅ Resolved',v:'resolved'}]
              : [{l:'All',v:'all'},{l:'👁 Visible',v:'visible'},{l:'🙈 Hidden',v:'hidden'}]
            ).map(c=>(
              <button key={c.v} onClick={()=>setFilter(c.v)} style={{padding:'0.4rem 0.9rem',borderRadius:20,border:'1.5px solid',fontWeight:600,fontSize:'0.8rem',cursor:'pointer',transition:'all .2s',
                background:filter===c.v?'linear-gradient(135deg,#7c3aed,#6d28d9)':'var(--surface,#fff)',
                color:filter===c.v?'#fff':'var(--text-2,#64748b)',borderColor:filter===c.v?'#7c3aed':'var(--border,#e2e8f0)'}}>{c.l}</button>
            ))}
          </div>
        </div>

        {/* ── Complaints list ── */}
        {tab === 'complaints' && (
          <div style={{display:'grid',gap:'0.8rem'}}>
            {filteredComplaints.length === 0
              ? <div style={{background:'var(--surface,#fff)',borderRadius:14,padding:'3rem',textAlign:'center',color:'var(--text-2,#64748b)',border:'1.5px solid var(--border,#e2e8f0)'}}>No complaints</div>
              : filteredComplaints.map(c => (
                <div key={c._id} onClick={()=>{ setSelected({...c,_kind:'complaint'}); setReply(c.adminReply||''); }}
                  style={{background:'var(--surface,#fff)',borderRadius:14,padding:'1rem 1.2rem',border:`1.5px solid ${c.status==='resolved'?'var(--border,#e2e8f0)':'#fbbf24'}`,cursor:'pointer',transition:'all .2s',boxShadow:'0 2px 8px rgba(0,0,0,.04)',display:'flex',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}
                  onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.09)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)'; e.currentTarget.style.transform=''; }}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.9rem',flexShrink:0}}>{c.name?.[0]?.toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.2rem'}}>
                      <span style={{fontWeight:700,color:'var(--text,#1e293b)',fontSize:'0.92rem'}}>{c.subject}</span>
                      <SBadge s={c.status}/>
                    </div>
                    <div style={{fontSize:'0.8rem',color:'var(--text-2,#64748b)',marginBottom:'0.2rem'}}>{c.name} · {c.email}</div>
                    <div style={{fontSize:'0.8rem',color:'var(--text-3,#94a3b8)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.message}</div>
                  </div>
                  <div style={{fontSize:'0.72rem',color:'var(--text-3,#94a3b8)',flexShrink:0}}>{new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── Feedback list ── */}
        {tab === 'feedback' && (
          <div style={{display:'grid',gap:'0.8rem'}}>
            {filteredFeedback.length === 0
              ? <div style={{background:'var(--surface,#fff)',borderRadius:14,padding:'3rem',textAlign:'center',color:'var(--text-2,#64748b)',border:'1.5px solid var(--border,#e2e8f0)'}}>No feedback</div>
              : filteredFeedback.map(f => (
                <div key={f._id} style={{background:'var(--surface,#fff)',borderRadius:14,padding:'1rem 1.2rem',border:'1.5px solid var(--border,#e2e8f0)',transition:'all .2s',boxShadow:'0 2px 8px rgba(0,0,0,.04)',display:'flex',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap',opacity:f.visible?1:.6}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#d97706)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.9rem',flexShrink:0}}>{f.name?.[0]?.toUpperCase()}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.3rem'}}>
                      <span style={{fontWeight:700,color:'var(--text,#1e293b)',fontSize:'0.9rem'}}>{f.name}</span>
                      <Stars n={f.rating}/>
                      {f.itemRecovered && <span style={{background:'#d1fae5',color:'#065f46',padding:'0.15rem 0.6rem',borderRadius:20,fontSize:'0.7rem',fontWeight:700}}>✅ {f.itemRecovered}</span>}
                      {!f.visible && <span style={{background:'#fee2e2',color:'#991b1b',padding:'0.15rem 0.6rem',borderRadius:20,fontSize:'0.7rem',fontWeight:700}}>🙈 Hidden</span>}
                    </div>
                    <div style={{fontSize:'0.8rem',color:'var(--text-2,#64748b)',marginBottom:'0.3rem'}}>{f.email}</div>
                    <p style={{fontSize:'0.85rem',color:'var(--text-2,#64748b)',margin:0,lineHeight:1.5}}>{f.message.length>120?f.message.slice(0,120)+'…':f.message}</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',flexShrink:0,alignItems:'flex-end'}}>
                    <span style={{fontSize:'0.72rem',color:'var(--text-3,#94a3b8)'}}>{new Date(f.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                    <div style={{display:'flex',gap:'0.4rem'}}>
                      <button onClick={()=>toggleFeedback(f._id)} style={{background:f.visible?'#fee2e2':'#d1fae5',color:f.visible?'#991b1b':'#065f46',border:'none',borderRadius:8,padding:'0.3rem 0.7rem',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>{f.visible?'🙈 Hide':'👁 Show'}</button>
                      <button onClick={()=>deleteFeedback(f._id)} style={{background:'#fee2e2',color:'#991b1b',border:'none',borderRadius:8,padding:'0.3rem 0.7rem',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>🗑</button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Complaint detail modal */}
      <Modal open={!!selected && selected?._kind==='complaint'} onClose={()=>{ setSelected(null); setReply(''); }}>
        {selected && (
          <>
            <div style={{padding:'1.5rem 1.5rem 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h4 style={{fontWeight:800,color:'var(--text,#1e293b)',margin:0}}>{selected.subject}</h4>
              <button onClick={()=>{ setSelected(null); setReply(''); }} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'var(--text-2,#475569)',lineHeight:1}}>×</button>
            </div>
            <div style={{padding:'1rem 1.5rem 1.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.8rem',marginBottom:'1rem'}}>
                <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800}}>{selected.name?.[0]?.toUpperCase()}</div>
                <div><div style={{fontWeight:700,color:'var(--text,#1e293b)'}}>{selected.name}</div><div style={{fontSize:'0.8rem',color:'var(--text-3,#94a3b8)'}}>{selected.email} · {new Date(selected.createdAt).toLocaleString()}</div></div>
                <div style={{marginLeft:'auto'}}><SBadge s={selected.status}/></div>
              </div>
              <div style={{background:'var(--bg,#f8fafc)',borderRadius:12,padding:'1rem',marginBottom:'1rem',border:'1px solid var(--border,#e2e8f0)'}}>
                <p style={{color:'var(--text,#1e293b)',lineHeight:1.7,margin:0,fontSize:'0.9rem'}}>{selected.message}</p>
              </div>
              {selected.adminReply && <div style={{background:'rgba(59,130,246,.07)',borderRadius:10,padding:'0.9rem',marginBottom:'1rem',borderLeft:'3px solid #3b82f6'}}><div style={{fontSize:'0.73rem',fontWeight:700,color:'#3b82f6',marginBottom:4}}>Admin Reply</div><p style={{color:'var(--text,#1e293b)',margin:0,fontSize:'0.88rem'}}>{selected.adminReply}</p></div>}
              {selected.status !== 'resolved' && (
                <>
                  <label style={{fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',color:'#94a3b8',display:'block',marginBottom:'0.4rem'}}>Reply (optional)</label>
                  <textarea rows={3} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Reply to the student…" style={{width:'100%',padding:'0.65rem 0.9rem',borderRadius:9,border:'1.5px solid var(--border,#e2e8f0)',background:'var(--surface,#fff)',color:'var(--text,#1e293b)',fontSize:'0.88rem',outline:'none',resize:'vertical',fontFamily:'inherit',marginBottom:'0.8rem'}}/>
                  <button onClick={()=>resolveComplaint(selected._id,reply)} disabled={saving} style={{width:'100%',padding:'0.8rem',borderRadius:12,border:'none',background:saving?'#94a3b8':'linear-gradient(135deg,#10b981,#059669)',color:'#fff',fontWeight:700,cursor:saving?'not-allowed':'pointer',fontSize:'0.95rem'}}>
                    {saving?'⏳ Saving…':'✅ Mark as Resolved'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
