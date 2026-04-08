import React, { useState, useEffect, useMemo } from 'react'
import { getImageUrl } from '../../utils'
import { getClaims } from '../../api/adminService.js'

const Badge = ({ status }) => {
  const m = { found:{bg:'#d1fae5',c:'#065f46',l:'Found'}, claimed:{bg:'#dbeafe',c:'#1e40af',l:'Claimed'}, returned:{bg:'#ede9fe',c:'#5b21b6',l:'Returned'} }
  const s = m[status?.toLowerCase()] || { bg:'#f1f5f9', c:'#475569', l: status || '—' }
  return <span style={{ background:s.bg, color:s.c, padding:'0.22rem 0.7rem', borderRadius:20, fontSize:'0.72rem', fontWeight:700 }}>{s.l}</span>
}

const Modal = ({ open, onClose, children }) => open ? (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(6px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:'var(--surface,#fff)', borderRadius:20, maxWidth:680, width:'100%', maxHeight:'92vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.25)', border:'1px solid var(--border,#e2e8f0)' }}>
      {children}
    </div>
  </div>
) : null

const InfoRow = ({ label, value }) => value ? (
  <div style={{ padding:'0.7rem 0', borderBottom:'1px solid var(--border,#e2e8f0)' }}>
    <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-3,#94a3b8)', marginBottom:'0.2rem' }}>{label}</div>
    <div style={{ fontSize:'0.92rem', color:'var(--text,#1e293b)', lineHeight:1.5 }}>{value}</div>
  </div>
) : null

export default function FoundItemsManagement({ toast }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [viewItem, setViewItem] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [claims, setClaims] = useState([])

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const [itemsRes, claimsData] = await Promise.all([
        fetch('/api/found-items').then(r => r.json()),
        getClaims().catch(() => [])
      ])
      setItems(itemsRes)
      setClaims(Array.isArray(claimsData) ? claimsData : [])
    }
    catch { toast?.error('Failed to load found items') }
    finally { setLoading(false) }
  }

  // Helper: get the approved claim for a given item
  const getApprovedClaim = (itemId) =>
    claims.find(c => c.itemId === itemId && c.status === 'approved')

  const cats = ['All', ...new Set(items.map(it => it.category).filter(Boolean))]

  const filtered = useMemo(() => {
    let out = items
    if (filterCat !== 'All') out = out.filter(it => it.category === filterCat)
    if (search) out = out.filter(it => [it.title, it.location, it.description].join(' ').toLowerCase().includes(search.toLowerCase()))
    return [...out].sort((a, b) => {
      const va = a[sortKey] || '', vb = b[sortKey] || ''
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
  }, [items, search, filterCat, sortKey, sortDir])

  const toggleSort = key => { if (sortKey === key) setSortDir(d => d==='asc'?'desc':'asc'); else { setSortKey(key); setSortDir('asc') } }

  const doDelete = async () => {
    try {
      await fetch(`/api/found-items/${deleteTarget._id}`, { method: 'DELETE' })
      setItems(p => p.filter(i => i._id !== deleteTarget._id))
      toast?.success('Item deleted'); setDeleteTarget(null)
    } catch { toast?.error('Delete failed') }
  }

  const doEdit = async () => {
    try {
      const r = await fetch(`/api/found-items/${editItem._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
      const updated = await r.json()
      setItems(p => p.map(i => i._id === editItem._id ? updated : i))
      toast?.success('Item updated'); setEditItem(null)
    } catch { toast?.error('Update failed') }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTopColor:'#10b981', borderRadius:'50%', animation:'spin .8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  return (
    <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh' }}>
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 70%,#10b981 100%)', color:'#fff', padding:'3rem 0 4rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', right:'-5%', width:280, height:280, borderRadius:'50%', background:'rgba(16,185,129,.15)', filter:'blur(60px)' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.5rem', position:'relative', zIndex:2 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🟢</div>
          <h1 style={{ fontSize:'2.2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:'0.3rem' }}>Found Items Management</h1>
          <p style={{ color:'rgba(255,255,255,.65)', margin:0 }}>{items.length} total records</p>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0 }}><svg viewBox="0 0 1440 48" fill="none" style={{ display:'block' }}><path d="M0,32 C360,0 1080,48 1440,12 L1440,48 L0,48 Z" fill="#f8fafc"/></svg></div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'1.5rem' }}>
        <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1rem' }}>
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items…" style={{ width:'100%', padding:'0.65rem 1rem 0.65rem 2.5rem', borderRadius:10, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.9rem', outline:'none' }}/>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {cats.map(c => (
            <button key={c} onClick={()=>setFilterCat(c)} style={{ padding:'0.35rem 0.9rem', borderRadius:20, border:'1.5px solid', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', transition:'all .2s', background:filterCat===c?'linear-gradient(135deg,#10b981,#059669)':'var(--surface,#fff)', color:filterCat===c?'#fff':'var(--text-3,#94a3b8)', borderColor:filterCat===c?'transparent':'var(--border,#e2e8f0)' }}>{c}</button>
          ))}
          <span style={{ marginLeft:'auto', alignSelf:'center', color:'#94a3b8', fontSize:'0.85rem', fontWeight:600 }}>{filtered.length} items</span>
        </div>

        {/* Clickable rows */}
        <div style={{ display:'grid', gap:'0.6rem' }}>
          {filtered.length === 0
            ? <div style={{ background:'var(--surface,#fff)', borderRadius:14, padding:'3rem', textAlign:'center', color:'#94a3b8', border:'1.5px solid var(--border,#e2e8f0)' }}>No items found</div>
            : filtered.map(item => {
                const imgSrc = item.imageUrl ? getImageUrl(item.imageUrl) : null;
                return (
                  <div key={item._id} onClick={()=>setViewItem(item)}
                    style={{ background:'var(--surface,#fff)', borderRadius:14, padding:'0.9rem 1.1rem', border:'1.5px solid var(--border,#e2e8f0)', cursor:'pointer', transition:'all .18s', display:'flex', alignItems:'center', gap:'1rem', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor='#10b981'; e.currentTarget.style.boxShadow='0 4px 18px rgba(16,185,129,.12)'; e.currentTarget.style.transform='translateX(3px)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border,#e2e8f0)'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,.04)'; e.currentTarget.style.transform=''; }}>
                    {imgSrc
                      ? <img src={imgSrc} alt="" style={{ width:50, height:50, borderRadius:10, objectFit:'contain', border:'1.5px solid var(--border,#e2e8f0)', background:'#f8fafc', padding:3, flexShrink:0 }}/>
                      : <div style={{ width:50, height:50, borderRadius:10, background:'#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>📦</div>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text,#1e293b)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'0.2rem' }}>{item.title}</div>
                      <div style={{ fontSize:'0.77rem', color:'var(--text-3,#94a3b8)', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                        {item.category && <span>📂 {item.category}</span>}
                        {item.location && <span>📍 {item.location}</span>}
                        {item.createdAt && <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                      <Badge status={item.status||'found'}/>
                      <div style={{ display:'flex', gap:'0.35rem' }} onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>{ setEditItem(item); setEditForm({ title:item.title, location:item.location, category:item.category, description:item.description, contact:item.contact, status:item.status }) }}
                          style={{ background:'#dbeafe', color:'#1e40af', border:'none', borderRadius:7, padding:'0.3rem 0.65rem', fontWeight:600, fontSize:'0.75rem', cursor:'pointer' }}>✏️</button>
                        <button onClick={()=>setDeleteTarget(item)}
                          style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:7, padding:'0.3rem 0.65rem', fontWeight:600, fontSize:'0.75rem', cursor:'pointer' }}>🗑️</button>
                      </div>
                      <span style={{ color:'#94a3b8', fontSize:'1rem' }}>›</span>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* VIEW DETAIL MODAL — full image + all fields */}
      <Modal open={!!viewItem} onClose={()=>setViewItem(null)}>
        {viewItem && (
          <>
            <div style={{ position:'relative', background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', borderRadius:'20px 20px 0 0', overflow:'hidden', minHeight:200 }}>
              {viewItem.imageUrl
                ? <img src={getImageUrl(viewItem.imageUrl)} alt={viewItem.title} style={{ width:'100%', height:280, objectFit:'contain', objectPosition:'center', display:'block', background:'#f8fafc', padding:'12px' }}/>
                : <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.5rem', background:'#f8fafc' }}>
                    <span style={{ fontSize:'4rem' }}>📦</span>
                    <span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>No image provided</span>
                  </div>
              }
              <div style={{ position:'absolute', top:14, left:14 }}><Badge status={viewItem.status||'found'}/></div>
              <button onClick={()=>setViewItem(null)} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', border:'none', width:32, height:32, borderRadius:'50%', color:'#fff', fontSize:'1.1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>
            <div style={{ padding:'1.8rem' }}>
              <h3 style={{ fontWeight:900, color:'var(--text,#1e293b)', marginBottom:'0.4rem', fontSize:'1.3rem' }}>{viewItem.title}</h3>
              <p style={{ color:'var(--text-3,#94a3b8)', fontSize:'0.8rem', marginBottom:'1.2rem', fontFamily:'monospace' }}>ID: {viewItem._id}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1.5rem' }}>
                <InfoRow label="Category" value={viewItem.category}/>
                <InfoRow label="Location Found" value={viewItem.location}/>
                <InfoRow label="Date Found" value={viewItem.dateFound?new Date(viewItem.dateFound).toLocaleDateString():undefined}/>
                <InfoRow label="Contact" value={viewItem.contact}/>
                <InfoRow label="Reported By" value={viewItem.reportedBy}/>
                <InfoRow label="Reported On" value={viewItem.createdAt?new Date(viewItem.createdAt).toLocaleString():undefined}/>
              </div>
              <InfoRow label="Description" value={viewItem.description}/>
              {(() => {
                const ac = getApprovedClaim(viewItem._id);
                return ac ? (
                  <div style={{ marginTop:'1.2rem', background:'#ede9fe', border:'1.5px solid #c4b5fd', borderRadius:14, padding:'1rem 1.2rem' }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#7c3aed', marginBottom:'0.6rem' }}>🙋 Claimed By</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem 1.5rem' }}>
                      <div>
                        <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', marginBottom:'0.15rem' }}>Name</div>
                        <div style={{ fontWeight:700, color:'#5b21b6', fontSize:'0.9rem' }}>{ac.claimantName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', marginBottom:'0.15rem' }}>Claim ID</div>
                        <div style={{ fontWeight:600, color:'#5b21b6', fontSize:'0.82rem', fontFamily:'monospace' }}>{ac._id}</div>
                      </div>
                      {ac.claimantEmail && <div>
                        <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', marginBottom:'0.15rem' }}>Email</div>
                        <div style={{ fontWeight:600, color:'#5b21b6', fontSize:'0.85rem' }}>{ac.claimantEmail}</div>
                      </div>}
                      {ac.contact && <div>
                        <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', marginBottom:'0.15rem' }}>Phone</div>
                        <div style={{ fontWeight:600, color:'#5b21b6', fontSize:'0.85rem' }}>{ac.contact}</div>
                      </div>}
                      {ac.createdAt && <div style={{ gridColumn:'1/-1' }}>
                        <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', marginBottom:'0.15rem' }}>Claimed On</div>
                        <div style={{ fontWeight:600, color:'#5b21b6', fontSize:'0.85rem' }}>{new Date(ac.createdAt).toLocaleString()}</div>
                      </div>}
                    </div>
                  </div>
                ) : null;
              })()}
              <div style={{ display:'flex', gap:'0.8rem', marginTop:'1.5rem' }}>
                <button onClick={()=>{ setViewItem(null); setEditItem(viewItem); setEditForm({ title:viewItem.title, location:viewItem.location, category:viewItem.category, description:viewItem.description, contact:viewItem.contact, status:viewItem.status }) }} style={{ flex:1, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, padding:'0.75rem', fontWeight:700, cursor:'pointer' }}>✏️ Edit Item</button>
                <button onClick={()=>setViewItem(null)} style={{ flex:1, background:'var(--surface2,#f1f5f9)', color:'var(--text-3,#94a3b8)', border:'1px solid var(--border,#e2e8f0)', borderRadius:10, padding:'0.75rem', fontWeight:600, cursor:'pointer' }}>Close</button>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={!!editItem} onClose={()=>setEditItem(null)}>
        <div style={{ padding:'1.8rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <h4 style={{ fontWeight:800, color:'var(--text,#1e293b)', margin:0 }}>✏️ Edit Found Item</h4>
            <button onClick={()=>setEditItem(null)} style={{ background:'none', border:'none', fontSize:'1.4rem', cursor:'pointer', color:'#94a3b8' }}>×</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem' }}>
            {[['Title','title'],['Location','location'],['Category','category'],['Contact','contact']].map(([l,k]) => (
              <div key={k}>
                <label style={{ fontSize:'0.78rem', fontWeight:600, color:'#94a3b8', display:'block', marginBottom:'0.3rem', textTransform:'uppercase', letterSpacing:'0.04em' }}>{l}</label>
                <input value={editForm[k]||''} onChange={e=>setEditForm(p=>({...p,[k]:e.target.value}))} style={{ width:'100%', padding:'0.6rem 0.9rem', borderRadius:8, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem', outline:'none' }}/>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'0.9rem' }}>
            <label style={{ fontSize:'0.78rem', fontWeight:600, color:'#94a3b8', display:'block', marginBottom:'0.3rem', textTransform:'uppercase' }}>Description</label>
            <textarea rows={3} value={editForm.description||''} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))} style={{ width:'100%', padding:'0.6rem 0.9rem', borderRadius:8, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem', outline:'none', resize:'vertical', fontFamily:'inherit' }}/>
          </div>
          <div style={{ marginTop:'0.9rem' }}>
            <label style={{ fontSize:'0.78rem', fontWeight:600, color:'#94a3b8', display:'block', marginBottom:'0.3rem', textTransform:'uppercase' }}>Status</label>
            <select value={editForm.status||'found'} onChange={e=>setEditForm(p=>({...p,status:e.target.value}))} style={{ width:'100%', padding:'0.6rem 0.9rem', borderRadius:8, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem' }}>
              <option value="found">Found</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:'0.8rem', marginTop:'1.5rem' }}>
            <button onClick={doEdit} style={{ flex:1, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, padding:'0.75rem', fontWeight:700, cursor:'pointer' }}>💾 Save Changes</button>
            <button onClick={()=>setEditItem(null)} style={{ flex:1, background:'var(--surface2,#f1f5f9)', color:'#94a3b8', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem', fontWeight:600, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)}>
        <div style={{ padding:'2rem', textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚠️</div>
          <h4 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'0.5rem' }}>Delete Item?</h4>
          <p style={{ color:'#94a3b8', marginBottom:'1.5rem' }}>Delete <strong style={{ color:'var(--text,#1e293b)' }}>"{deleteTarget?.title}"</strong>? This cannot be undone.</p>
          <div style={{ display:'flex', gap:'0.8rem' }}>
            <button onClick={()=>setDeleteTarget(null)} style={{ flex:1, background:'var(--surface2,#f1f5f9)', color:'#94a3b8', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem', fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={doDelete} style={{ flex:1, background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', border:'none', borderRadius:10, padding:'0.75rem', fontWeight:700, cursor:'pointer' }}>🗑️ Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}