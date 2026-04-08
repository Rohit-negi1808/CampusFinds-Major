import React, { useState, useEffect } from 'react'

const StatusBadge = ({ s }) => {
  const M = {
    resolved: { bg:'#dbeafe', c:'#1e40af', t:'✅ Resolved' },
    pending:  { bg:'#fef3c7', c:'#92400e', t:'⏳ Pending'  },
  }
  const x = M[s] || M.pending
  return <span style={{ background:x.bg, color:x.c, padding:'0.22rem 0.7rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700 }}>{x.t}</span>
}

const ClaimBadge = ({ s }) => {
  const M = {
    waiting:  { bg:'#fef3c7', c:'#92400e', t:'⏳ Pending'  },
    pending:  { bg:'#fef3c7', c:'#92400e', t:'⏳ Pending'  },
    approved: { bg:'#d1fae5', c:'#065f46', t:'✅ Approved' },
    rejected: { bg:'#fee2e2', c:'#991b1b', t:'❌ Rejected' },
  }
  const x = M[s?.toLowerCase()] || M.waiting
  return <span style={{ background:x.bg, color:x.c, padding:'0.22rem 0.7rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700 }}>{x.t}</span>
}

const Stars = ({ value, onChange, readonly }) => (
  <div style={{ display:'flex', gap:'0.2rem' }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} onClick={()=>!readonly && onChange?.(n)}
        style={{ fontSize:'1.6rem', cursor:readonly?'default':'pointer', color: n <= value ? '#f59e0b' : '#e2e8f0', transition:'color .15s' }}
        onMouseEnter={e=>{ if(!readonly) e.target.style.color='#f59e0b' }}
        onMouseLeave={e=>{ if(!readonly) e.target.style.color = n <= value ? '#f59e0b' : '#e2e8f0' }}
      >★</span>
    ))}
  </div>
)

const inp = { width:'100%', padding:'0.65rem 0.9rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.9rem', outline:'none', fontFamily:'inherit' }

export default function ContactPage({ currentUser, toast }) {
  const [tab, setTab] = useState('complaints')

  /* ── Complaints state ── */
  const [cForm, setCForm] = useState({ name:currentUser?.name||'', email:currentUser?.email||'', subject:'', message:'' })
  const [cSending, setCSending] = useState(false)
  const [myComplaints, setMyComplaints]         = useState([])
  const [loadingComplaints, setLoadingComplaints] = useState(false)

  /* ── Claims state ── */
  const [myClaims, setMyClaims]       = useState([])
  const [loadingClaims, setLoadingClaims] = useState(false)

  /* ── Feedback state ── */
  const [fForm, setFForm]     = useState({ name:currentUser?.name||'', email:currentUser?.email||'', rating:0, message:'', itemRecovered:'' })
  const [fSending, setFSending] = useState(false)
  const [fDone, setFDone]     = useState(false)

  useEffect(() => {
    if (tab === 'myComplaints' && currentUser?.email) loadComplaints()
    if (tab === 'myClaims'     && currentUser?.email) loadClaims()
  }, [tab, currentUser])

  const loadComplaints = async () => {
    setLoadingComplaints(true)
    try { const baseUrl = import.meta.env.VITE_API_URL || ''; const r = await fetch(`${baseUrl}/api/contact/by-email/${encodeURIComponent(currentUser.email)}`); setMyComplaints(await r.json()) }
    catch{} finally { setLoadingComplaints(false) }
  }
  const loadClaims = async () => {
    setLoadingClaims(true)
    try { const baseUrl = import.meta.env.VITE_API_URL || ''; const r = await fetch(`${baseUrl}/api/claims/by-email/${encodeURIComponent(currentUser.email)}`); if(r.ok) setMyClaims(await r.json()) }
    catch{} finally { setLoadingClaims(false) }
  }

  const submitComplaint = async () => {
    if (!cForm.name||!cForm.email||!cForm.subject||!cForm.message) return toast?.error('Please fill all fields')
    setCSending(true)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || ''
      const r = await fetch(`${baseUrl}/api/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(cForm) })
      if (!r.ok) throw new Error()
      toast?.success('Complaint submitted! We will respond soon.')
      setCForm(p=>({ ...p, subject:'', message:'' }))
    } catch { toast?.error('Failed to submit. Try again.') }
    finally { setCSending(false) }
  }

  const submitFeedback = async () => {
    if (!fForm.name||!fForm.email||!fForm.rating||!fForm.message) return toast?.error('Please fill name, email, rating and message')
    setFSending(true)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || ''
      const r = await fetch(`${baseUrl}/api/feedback`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(fForm) })
      if (!r.ok) throw new Error()
      setFDone(true)
      toast?.success('Thank you for your feedback! 🎉')
    } catch { toast?.error('Failed to submit. Try again.') }
    finally { setFSending(false) }
  }

  const TABS = [
    { id:'complaints',    label:'📝 Submit Complaint' },
    { id:'feedback',      label:'⭐ Give Feedback'     },
    { id:'myComplaints',  label:'📋 My Complaints'    },
    { id:'myClaims',      label:'🙋 My Claims'        },
  ]

  const cardStyle = { background:'var(--surface,#fff)', borderRadius:16, padding:'1.8rem', border:'1.5px solid var(--border,#e2e8f0)', boxShadow:'0 2px 10px rgba(0,0,0,.05)' }
  const lblStyle  = { fontSize:'0.73rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-3,#94a3b8)', display:'block', marginBottom:'0.3rem' }

  return (
    <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh' }}>
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#3b82f6 100%)', color:'#fff', padding:'3.5rem 0 5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', right:'-5%', width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.1)', filter:'blur(60px)' }}/>
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', borderRadius:50, padding:'0.35rem 1rem', marginBottom:'1rem', fontSize:'0.8rem', fontWeight:600 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#93c5fd', display:'inline-block' }}/>
            Student Support
          </div>
          <h1 style={{ fontSize:'2.2rem', fontWeight:900, letterSpacing:'-0.5px', marginBottom:'0.4rem' }}>💬 Complaints & Feedback</h1>
          <p style={{ opacity:.8, maxWidth:480, margin:'0 auto', fontSize:'0.95rem' }}>Submit complaints, share your experience, or track your requests.</p>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
          <svg viewBox="0 0 1440 56" fill="none" style={{ display:'block' }}><path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="var(--bg,#f8fafc)"/></svg>
        </div>
      </div>

      <div style={{ maxWidth:840, margin:'0 auto', padding:'1.5rem 1.5rem 4rem' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.4rem', marginBottom:'2rem', background:'var(--surface,#fff)', padding:'0.35rem', borderRadius:14, border:'1.5px solid var(--border,#e2e8f0)', flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:'1 1 auto', padding:'0.55rem 0.9rem', borderRadius:10, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.82rem', transition:'all .2s', whiteSpace:'nowrap',
              background:tab===t.id?'linear-gradient(135deg,#1d4ed8,#3b82f6)':'transparent',
              color:tab===t.id?'#fff':'var(--text-2,#64748b)' }}>{t.label}</button>
          ))}
        </div>

        {/* ── Submit Complaint ── */}
        {tab === 'complaints' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:'1.5rem' }}>
            {/* Info */}
            <div style={cardStyle}>
              <h4 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'1.2rem', fontSize:'1rem' }}>🏫 Student Care Office</h4>
              {[['📍','Location','E1 Block, Room 105\nNorth Campus, CU'],['📞','Phone','(123) 456-7890'],['✉️','Email','campusfinds@campus.edu'],['🕐','Hours','Mon–Fri: 10 AM – 4 PM\nSat: 10 AM – 1 PM']].map(([icon,label,val])=>(
                <div key={label} style={{ marginBottom:'1rem' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-3,#94a3b8)', marginBottom:'0.2rem' }}>{icon} {label}</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text,#1e293b)', whiteSpace:'pre-line', fontWeight:500 }}>{val}</div>
                </div>
              ))}
            </div>
            {/* Form */}
            <div style={cardStyle}>
              <h4 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'1.2rem', fontSize:'1rem' }}>📝 Submit a Complaint</h4>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem', marginBottom:'0.7rem' }}>
                <div><label style={lblStyle}>Your Name</label><input style={inp} placeholder="Full name" value={cForm.name} onChange={e=>setCForm(p=>({...p,name:e.target.value}))}/></div>
                <div><label style={lblStyle}>Email</label><input style={inp} type="email" placeholder="your@email.com" value={cForm.email} onChange={e=>setCForm(p=>({...p,email:e.target.value}))}/></div>
              </div>
              <div style={{ marginBottom:'0.7rem' }}><label style={lblStyle}>Subject</label><input style={inp} placeholder="What is this about?" value={cForm.subject} onChange={e=>setCForm(p=>({...p,subject:e.target.value}))}/></div>
              <div style={{ marginBottom:'1rem' }}><label style={lblStyle}>Message</label><textarea style={{...inp,resize:'vertical'}} rows={4} placeholder="Describe your issue..." value={cForm.message} onChange={e=>setCForm(p=>({...p,message:e.target.value}))}/></div>
              <button onClick={submitComplaint} disabled={cSending} style={{ width:'100%', padding:'0.8rem', borderRadius:12, border:'none', background:cSending?'#94a3b8':'linear-gradient(135deg,#1d4ed8,#3b82f6)', color:'#fff', fontWeight:700, cursor:cSending?'not-allowed':'pointer', fontSize:'0.95rem' }}>
                {cSending ? '⏳ Sending…' : '📤 Submit Complaint'}
              </button>
            </div>
          </div>
        )}

        {/* ── Give Feedback ── */}
        {tab === 'feedback' && (
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            {fDone ? (
              <div style={{ ...cardStyle, textAlign:'center', padding:'3rem' }}>
                <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎉</div>
                <h3 style={{ fontWeight:900, color:'var(--text,#1e293b)', marginBottom:'0.5rem' }}>Thank you!</h3>
                <p style={{ color:'var(--text-2,#64748b)', marginBottom:'1.5rem' }}>Your feedback has been posted to our success stories. We really appreciate it!</p>
                <button onClick={()=>setFDone(false)} style={{ background:'#6366f1', color:'#fff', border:'none', borderRadius:10, padding:'0.65rem 1.5rem', fontWeight:700, cursor:'pointer' }}>Submit Another</button>
              </div>
            ) : (
              <div style={cardStyle}>
                <h4 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'0.4rem', fontSize:'1.1rem' }}>⭐ Share Your Experience</h4>
                <p style={{ color:'var(--text-2,#64748b)', fontSize:'0.875rem', marginBottom:'1.5rem' }}>Did CampusFinds help you? Your real story will inspire other students!</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem', marginBottom:'0.7rem' }}>
                  <div><label style={lblStyle}>Your Name</label><input style={inp} placeholder="Full name" value={fForm.name} onChange={e=>setFForm(p=>({...p,name:e.target.value}))}/></div>
                  <div><label style={lblStyle}>Email</label><input style={inp} type="email" placeholder="your@email.com" value={fForm.email} onChange={e=>setFForm(p=>({...p,email:e.target.value}))}/></div>
                </div>
                <div style={{ marginBottom:'0.7rem' }}><label style={lblStyle}>What did you recover? (optional)</label><input style={inp} placeholder="e.g. Laptop bag, Wallet, Student ID..." value={fForm.itemRecovered} onChange={e=>setFForm(p=>({...p,itemRecovered:e.target.value}))}/></div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={lblStyle}>Your Rating</label>
                  <Stars value={fForm.rating} onChange={r=>setFForm(p=>({...p,rating:r}))}/>
                </div>
                <div style={{ marginBottom:'1.2rem' }}><label style={lblStyle}>Your Story</label><textarea style={{...inp,resize:'vertical'}} rows={4} placeholder="Share how CampusFinds helped you..." value={fForm.message} onChange={e=>setFForm(p=>({...p,message:e.target.value}))}/></div>
                <button onClick={submitFeedback} disabled={fSending} style={{ width:'100%', padding:'0.8rem', borderRadius:12, border:'none', background:fSending?'#94a3b8':'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', fontWeight:700, cursor:fSending?'not-allowed':'pointer', fontSize:'0.95rem' }}>
                  {fSending ? '⏳ Posting…' : '⭐ Post My Story'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── My Complaints ── */}
        {tab === 'myComplaints' && (
          <div>
            <h3 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'1.2rem', fontSize:'1rem' }}>📋 Your Complaint History</h3>
            {!currentUser ? <div style={{...cardStyle,textAlign:'center',padding:'3rem',color:'var(--text-2,#64748b)'}}><div style={{fontSize:'3rem',marginBottom:'1rem',opacity:.3}}>🔒</div><p>Please log in to view your complaints.</p></div>
            : loadingComplaints ? <div style={{textAlign:'center',padding:'3rem'}}><div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
            : myComplaints.length === 0 ? <div style={{...cardStyle,textAlign:'center',padding:'3rem',color:'var(--text-2,#64748b)'}}><div style={{fontSize:'3rem',marginBottom:'1rem',opacity:.3}}>📭</div><p>No complaints submitted yet.</p></div>
            : <div style={{display:'grid',gap:'1rem'}}>
                {myComplaints.map(c=>(
                  <div key={c._id} style={{ ...cardStyle, borderLeft:`4px solid ${c.status==='resolved'?'#3b82f6':'#f59e0b'}` }}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem',marginBottom:'0.5rem'}}>
                      <span style={{fontWeight:700,color:'var(--text,#1e293b)',fontSize:'0.95rem'}}>{c.subject}</span>
                      <StatusBadge s={c.status}/>
                    </div>
                    <p style={{color:'var(--text-2,#64748b)',fontSize:'0.85rem',margin:'0 0 0.4rem',lineHeight:1.5}}>{c.message.length>130?c.message.slice(0,130)+'…':c.message}</p>
                    {c.adminReply && <div style={{background:'rgba(59,130,246,.07)',borderRadius:8,padding:'0.7rem 0.9rem',borderLeft:'3px solid #3b82f6',marginTop:'0.5rem'}}><div style={{fontSize:'0.72rem',fontWeight:700,color:'#3b82f6',marginBottom:'0.2rem'}}>Admin Reply:</div><div style={{fontSize:'0.85rem',color:'var(--text,#1e293b)'}}>{c.adminReply}</div></div>}
                    <div style={{fontSize:'0.75rem',color:'var(--text-3,#94a3b8)',marginTop:'0.5rem'}}>{new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* ── My Claims ── */}
        {tab === 'myClaims' && (
          <div>
            <h3 style={{fontWeight:800,color:'var(--text,#1e293b)',marginBottom:'1.2rem',fontSize:'1rem'}}>🙋 Your Claim History</h3>
            {!currentUser ? <div style={{...cardStyle,textAlign:'center',padding:'3rem',color:'var(--text-2,#64748b)'}}><div style={{fontSize:'3rem',marginBottom:'1rem',opacity:.3}}>🔒</div><p>Please log in.</p></div>
            : loadingClaims ? <div style={{textAlign:'center',padding:'3rem'}}><div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTopColor:'#10b981',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto'}}/></div>
            : myClaims.length === 0 ? <div style={{...cardStyle,textAlign:'center',padding:'3rem',color:'var(--text-2,#64748b)'}}><div style={{fontSize:'3rem',marginBottom:'1rem',opacity:.3}}>📭</div><p>No claims submitted yet.</p><p style={{fontSize:'0.85rem'}}>Go to <strong>Found Items</strong> and click "Claim This Item".</p></div>
            : <div style={{display:'grid',gap:'1rem'}}>
                {myClaims.map(cl=>(
                  <div key={cl._id} style={{...cardStyle, borderLeft:`4px solid ${cl.status==='approved'?'#10b981':cl.status==='rejected'?'#ef4444':'#f59e0b'}`}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem',marginBottom:'0.5rem'}}>
                      <span style={{fontWeight:700,color:'var(--text,#1e293b)'}}>Claim #{cl._id?.slice(-5)}</span>
                      <ClaimBadge s={cl.status}/>
                    </div>
                    <p style={{color:'var(--text-2,#64748b)',fontSize:'0.85rem',margin:'0 0 0.4rem',lineHeight:1.5}}><strong>Message:</strong> {cl.message?.length>120?cl.message.slice(0,120)+'…':cl.message}</p>
                    <p style={{color:'var(--text-2,#64748b)',fontSize:'0.8rem',margin:0}}>📞 {cl.contact} · {new Date(cl.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                    {cl.adminNote && <div style={{background:'rgba(99,102,241,.07)',borderRadius:8,padding:'0.7rem 0.9rem',borderLeft:'3px solid #6366f1',marginTop:'0.5rem'}}><div style={{fontSize:'0.72rem',fontWeight:700,color:'#6366f1',marginBottom:'0.2rem'}}>📝 Admin Note:</div><div style={{fontSize:'0.85rem',color:'var(--text,#1e293b)'}}>{cl.adminNote}</div></div>}
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  )
}
