import React, { useState, useEffect, useMemo } from 'react';
import ItemCard from '../../components/ItemCard.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';
import { formatDate, getImageUrl, capitalizeFirstLetter } from '../../utils';

const CATEGORIES = ['All','Electronics','Books','Clothing','Accessories','Keys','Wallet','Phone','ID','Sports','Other'];
const ITEMS_PER_PAGE = 6;

const STATUS_MAP = {
  found:    { text:'🟢 Found',    badgeClass:'bg-success', fullText:'Found',    bg:'#d1fae5', c:'#065f46' },
  claimed:  { text:'📋 Claimed',  badgeClass:'bg-info',    fullText:'Claimed',  bg:'#ede9fe', c:'#5b21b6' },
  returned: { text:'✅ Returned', badgeClass:'bg-primary', fullText:'Returned', bg:'#dbeafe', c:'#1e40af' },
};
const getSt = st => STATUS_MAP[st?.toLowerCase()] || STATUS_MAP.found;

const inp = { width:'100%', padding:'0.6rem 0.9rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem', outline:'none', fontFamily:'inherit' };
const lbl = { fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', display:'block', marginBottom:'0.25rem' };

const Skeleton = () => (
  <div className="col-md-4">
    <div style={{ background:'var(--surface,#fff)', borderRadius:16, overflow:'hidden', border:'1.5px solid var(--border,#e2e8f0)' }}>
      <div style={{ height:200, background:'var(--hover,#f8fafc)', animation:'skpulse 1.5s ease infinite' }}/>
      <div style={{ padding:'1rem' }}>
        <div style={{ height:14, background:'var(--hover,#f8fafc)', borderRadius:6, width:'60%', marginBottom:'0.5rem', animation:'skpulse 1.5s .1s ease infinite' }}/>
        <div style={{ height:12, background:'var(--hover,#f8fafc)', borderRadius:6, width:'80%', animation:'skpulse 1.5s .2s ease infinite' }}/>
      </div>
    </div>
    <style>{`@keyframes skpulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
  </div>
);

const Modal = ({ open, onClose, children }) => open ? (
  <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
    <div onClick={e=>e.stopPropagation()} style={{ background:'var(--surface,#fff)', borderRadius:20, maxWidth:640, width:'100%', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,.2)' }}>
      {children}
    </div>
  </div>
) : null;

export default function FoundItemsPage({ showPage, currentUser }) {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [inputVal, setInputVal]         = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage]   = useState(1);
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimData, setClaimData]       = useState({ name:'', email:currentUser?.email||'', contact:'', message:'' });
  const [claimError, setClaimError]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const r = await fetch('/api/found-items');
        if (!r.ok) throw new Error('Server error ' + r.status);
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error('Invalid response');
        setItems(data.map(i => ({ ...i, type:'found' })));
      } catch(e) {
        console.error('Found items fetch error:', e);
        setError('Could not load found items. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let r = [...items];
    if (activeCategory !== 'All') r = r.filter(i=>(i.category||'').toLowerCase()===activeCategory.toLowerCase());
    if (search) r = r.filter(i=>[i.title,i.description,i.location].join(' ').toLowerCase().includes(search.toLowerCase()));
    if (dateFrom) r = r.filter(i=>i.dateFound&&new Date(i.dateFound)>=new Date(dateFrom));
    if (dateTo) { const e=new Date(dateTo); e.setHours(23,59,59,999); r=r.filter(i=>i.dateFound&&new Date(i.dateFound)<=e); }
    return r;
  }, [items, search, activeCategory, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);
  const doSearch   = () => { setSearch(inputVal); setCurrentPage(1); };

  const openItem = item => {
    setSelectedItem(item);
    setShowClaimForm(false); setClaimError('');
    setClaimData({ name:'', email:currentUser?.email||'', contact:'', message:'' });
  };

  const submitClaim = async () => {
    setClaimError('');
    if (!claimData.name || !claimData.contact || !claimData.message)
      return setClaimError('Please fill Name, Contact and Message.');
    setSubmitting(true);
    try {
      const r = await fetch('/api/claims', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ itemId:selectedItem._id, itemType:'found', claimantName:claimData.name, claimantEmail:claimData.email||'', contact:claimData.contact, message:claimData.message })
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error||json.message||'Server error');
      setShowClaimForm(false);
      setSelectedItem(null);
      setClaimData({ name:'', email:currentUser?.email||'', contact:'', message:'' });
      setShowSuccess(true);
    } catch(err){ setClaimError(err.message||'Failed. Try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh' }}>
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#047857 70%,#10b981 100%)', color:'#fff', padding:'3.5rem 0 5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', right:'-5%', width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.1)', filter:'blur(60px)' }}/>
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', borderRadius:50, padding:'0.35rem 1rem', marginBottom:'1rem', fontSize:'0.8rem', fontWeight:600 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#6ee7b7', display:'inline-block' }}/>
            Browse &amp; Claim Items
          </div>
          <h1 style={{ fontSize:'2.4rem', fontWeight:900, letterSpacing:'-0.5px', marginBottom:'0.5rem' }}>🟢 Found Items</h1>
          <p style={{ opacity:.85, maxWidth:500, margin:'0 auto' }}>Items found and submitted by fellow students — is yours here?</p>
        </div>
        <svg style={{ position:'absolute', bottom:0, left:0, right:0, display:'block' }} viewBox="0 0 1440 56" fill="none">
          <path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="var(--bg,#f8fafc)"/>
        </svg>
      </div>

      <div className="container pb-5">
        {/* Search */}
        <div style={{ display:'flex', gap:'0.5rem', maxWidth:560, margin:'0 auto 1rem' }}>
          <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}
            placeholder="Search by title, location…"
            style={{ flex:1, padding:'0.65rem 1rem', borderRadius:10, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.9rem', outline:'none' }}/>
          <button onClick={doSearch} style={{ padding:'0.65rem 1.2rem', borderRadius:10, border:'none', background:'#10b981', color:'#fff', fontWeight:700, cursor:'pointer' }}>🔍</button>
          {search && <button onClick={()=>{setSearch('');setInputVal('');}} style={{ padding:'0.65rem 0.9rem', borderRadius:10, border:'none', background:'#d1fae5', color:'#065f46', fontWeight:700, cursor:'pointer' }}>✕</button>}
        </div>

        {/* Category chips */}
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'0.8rem' }}>
          {CATEGORIES.map(cat=>(
            <button key={cat} onClick={()=>{setActiveCategory(cat);setCurrentPage(1);}}
              style={{ padding:'0.3rem 0.8rem', borderRadius:20, border:'1.5px solid', fontWeight:600, fontSize:'0.78rem', cursor:'pointer', transition:'all .15s',
                background:activeCategory===cat?'#10b981':'var(--surface,#fff)',
                color:activeCategory===cat?'#fff':'var(--text-2,#64748b)',
                borderColor:activeCategory===cat?'#10b981':'var(--border,#e2e8f0)' }}>{cat}</button>
          ))}
        </div>

        {/* Date filter */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'1.2rem' }}>
          <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-2,#64748b)' }}>📅 Date:</span>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{ padding:'0.35rem 0.7rem', borderRadius:8, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.82rem', outline:'none' }}/>
          <span style={{ color:'var(--text-3,#94a3b8)' }}>→</span>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{ padding:'0.35rem 0.7rem', borderRadius:8, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.82rem', outline:'none' }}/>
          {(dateFrom||dateTo)&&<button onClick={()=>{setDateFrom('');setDateTo('');}} style={{ background:'#d1fae5', color:'#065f46', border:'none', borderRadius:8, padding:'0.3rem 0.6rem', fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}>✕ Clear</button>}
        </div>

        {!loading && !error && <p style={{ textAlign:'center', color:'var(--text-3,#94a3b8)', fontSize:'0.82rem', marginBottom:'1rem' }}>{filtered.length} item{filtered.length!==1?'s':''} found</p>}

        {error && <div style={{ textAlign:'center', padding:'3rem', color:'#ef4444' }}><div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>⚠️</div><p>{error}</p><button onClick={()=>window.location.reload()} style={{ marginTop:'1rem', background:'#10b981', color:'#fff', border:'none', borderRadius:10, padding:'0.6rem 1.2rem', fontWeight:700, cursor:'pointer' }}>Retry</button></div>}

        {/* Grid */}
        {loading ? (
          <div className="row g-4">{[...Array(6)].map((_,i)=><Skeleton key={i}/>)}</div>
        ) : !error && (
          <>
            <div className="row g-4">
              {paginated.length > 0
                ? paginated.map(item => (
                    <ItemCard key={item._id} item={item}
                      showItemDetail={()=>openItem(item)}
                      statusInfo={getSt(item.status)}/>
                  ))
                : <div className="col-12" style={{ textAlign:'center', padding:'4rem', color:'var(--text-3,#94a3b8)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:'0.5rem', opacity:.3 }}>🔍</div>
                    <p style={{ fontWeight:600 }}>No found items matching your search</p>
                  </div>
              }
            </div>
            {totalPages > 1 && (
              <div style={{ display:'flex', gap:'0.4rem', justifyContent:'center', marginTop:'2rem', flexWrap:'wrap' }}>
                <button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1} style={{ padding:'0.4rem 0.8rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', cursor:currentPage===1?'not-allowed':'pointer', opacity:currentPage===1?.4:1 }}>‹</button>
                {[...Array(totalPages)].map((_,i)=>(
                  <button key={i} onClick={()=>setCurrentPage(i+1)} style={{ padding:'0.4rem 0.75rem', borderRadius:9, border:'1.5px solid', fontWeight:currentPage===i+1?700:500, background:currentPage===i+1?'#10b981':'var(--surface,#fff)', color:currentPage===i+1?'#fff':'var(--text-2,#64748b)', borderColor:currentPage===i+1?'#10b981':'var(--border,#e2e8f0)', cursor:'pointer' }}>{i+1}</button>
                ))}
                <button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} style={{ padding:'0.4rem 0.8rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', cursor:currentPage===totalPages?'not-allowed':'pointer', opacity:currentPage===totalPages?.4:1 }}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail + Claim Modal */}
      <Modal open={!!selectedItem} onClose={()=>{ setSelectedItem(null); setShowClaimForm(false); }}>
        {selectedItem && (() => {
          const st = getSt(selectedItem.status);
          return (
            <>
              <div style={{ position:'relative', background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', borderRadius:'20px 20px 0 0', minHeight:200 }}>
                {selectedItem.imageUrl
                  ? <img src={getImageUrl(selectedItem.imageUrl)} alt={selectedItem.title} style={{ width:'100%', height:260, objectFit:'contain', display:'block', padding:16 }}/>
                  : <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.5rem' }}><span style={{ fontSize:'4rem' }}>📦</span><span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>No image</span></div>}
                <span style={{ position:'absolute', top:14, left:14, background:st.bg, color:st.c, borderRadius:20, padding:'0.3rem 0.9rem', fontWeight:700, fontSize:'0.8rem' }}>{st.fullText}</span>
                <button onClick={()=>{ setSelectedItem(null); setShowClaimForm(false); }} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,.35)', border:'none', width:32, height:32, borderRadius:'50%', color:'#fff', fontSize:'1.1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
              </div>
              <div style={{ padding:'1.5rem' }}>
                <h3 style={{ fontWeight:900, color:'var(--text,#1e293b)', marginBottom:'0.3rem', fontSize:'1.3rem' }}>{selectedItem.title}</h3>
                <span style={{ background:'#f1f5f9', color:'#64748b', padding:'0.22rem 0.7rem', borderRadius:20, fontSize:'0.75rem', fontWeight:600, display:'inline-block', marginBottom:'0.8rem' }}>📂 {capitalizeFirstLetter(selectedItem.category||'Other')}</span>
                {selectedItem.description && <p style={{ color:'var(--text-2,#475569)', lineHeight:1.7, marginBottom:'1rem', fontSize:'0.88rem' }}>{selectedItem.description}</p>}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'0.6rem', marginBottom:'1.2rem' }}>
                  {[['📍 Found at',selectedItem.location],['📅 Date',formatDate(selectedItem.dateFound)],['📞 Contact',selectedItem.contact]].map(([l,v])=>v&&(
                    <div key={l} style={{ background:'var(--bg,#f8fafc)', borderRadius:10, padding:'0.7rem', border:'1px solid var(--border,#e2e8f0)' }}>
                      <div style={{ fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', color:'var(--text-3,#94a3b8)', marginBottom:'0.2rem' }}>{l}</div>
                      <div style={{ fontWeight:600, color:'var(--text,#1e293b)', fontSize:'0.85rem' }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Block claim button if item is already claimed or returned */}
                {['claimed','returned'].includes(selectedItem.status?.toLowerCase()) ? (
                  <div style={{ width:'100%', padding:'0.85rem 1rem', borderRadius:12, background:'#ede9fe', border:'1.5px solid #c4b5fd', color:'#5b21b6', fontWeight:700, fontSize:'0.9rem', textAlign:'center', marginBottom:'0.5rem' }}>
                    🔒 This item has already been claimed — it is no longer available.
                  </div>
                ) : (
                  <>
                    <button onClick={()=>{ setShowClaimForm(p=>!p); setClaimError(''); }}
                      style={{ width:'100%', padding:'0.8rem', borderRadius:12, border:'none', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', marginBottom:'0.5rem', transition:'all .2s',
                        background:showClaimForm?'#f1f5f9':'linear-gradient(135deg,#10b981,#059669)',
                        color:showClaimForm?'#64748b':'#fff' }}>
                      {showClaimForm ? '✕ Cancel' : '🙋 Claim This Item'}
                    </button>
                  </>
                )}
                {showClaimForm && !['claimed','returned'].includes(selectedItem.status?.toLowerCase()) && (
                  <div style={{ background:'var(--bg,#f8fafc)', borderRadius:14, padding:'1.2rem', border:'1px solid var(--border,#e2e8f0)', marginTop:'0.5rem' }}>
                    <h5 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'0.5rem', fontSize:'0.95rem' }}>🙋 Submit Your Claim</h5>
                    {claimError && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:9, padding:'0.6rem 0.9rem', marginBottom:'0.7rem', color:'#991b1b', fontSize:'0.82rem', fontWeight:500 }}>⚠️ {claimError}</div>}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'0.6rem' }}>
                      {[['Name *','name','text','Full name'],['Phone *','contact','text','Contact number']].map(([l,k,t,ph])=>(
                        <div key={k}><label style={lbl}>{l}</label><input type={t} placeholder={ph} value={claimData[k]} onChange={e=>setClaimData(p=>({...p,[k]:e.target.value}))} style={inp}/></div>
                      ))}
                    </div>
                    <div style={{ marginBottom:'0.6rem' }}>
                      <label style={lbl}>Email (auto-filled)</label>
                      <input type="email" value={claimData.email} onChange={e=>setClaimData(p=>({...p,email:e.target.value}))} style={inp}/>
                    </div>
                    <div style={{ marginBottom:'0.8rem' }}>
                      <label style={lbl}>Proof of Ownership *</label>
                      <textarea rows={3} placeholder="Why is this yours? Unique marks, what's inside, when you last had it..." value={claimData.message} onChange={e=>setClaimData(p=>({...p,message:e.target.value}))} style={{...inp,resize:'vertical'}}/>
                    </div>
                    <button onClick={submitClaim} disabled={submitting}
                      style={{ width:'100%', padding:'0.8rem', borderRadius:12, border:'none', background:submitting?'#94a3b8':'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontWeight:700, cursor:submitting?'not-allowed':'pointer' }}>
                      {submitting ? '⏳ Submitting…' : '✅ Submit Claim'}
                    </button>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Modal>

      <SuccessModal show={showSuccess} onClose={()=>setShowSuccess(false)} isClaim={true} claimData={claimData}/>
    </div>
  );
}