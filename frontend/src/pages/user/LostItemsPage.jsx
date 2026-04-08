import React, { useState, useEffect, useMemo } from 'react';
import ItemCard from '../../components/ItemCard.jsx';
import { formatDate, getImageUrl, capitalizeFirstLetter } from '../../utils';

const CATEGORIES = ['All','Electronics','Books','Clothing','Accessories','Keys','Wallet','Phone','ID','Sports','Other'];
const ITEMS_PER_PAGE = 6;
const STATUS_MAP = {
  lost:     { text:'🔴 Lost',     badgeClass:'bg-danger',  fullText:'Lost',     bg:'#fee2e2', c:'#991b1b' },
  found:    { text:'🟢 Found',    badgeClass:'bg-success', fullText:'Found',    bg:'#d1fae5', c:'#065f46' },
  returned: { text:'✅ Returned', badgeClass:'bg-primary', fullText:'Returned', bg:'#dbeafe', c:'#1e40af' },
  claimed:  { text:'📋 Claimed',  badgeClass:'bg-info',    fullText:'Claimed',  bg:'#ede9fe', c:'#5b21b6' },
};
const getSt = st => STATUS_MAP[st?.toLowerCase()] || STATUS_MAP.lost;

const Skeleton = () => (
  <div className="col-md-4">
    <div style={{ background:'var(--surface,#fff)', borderRadius:16, overflow:'hidden', border:'1px solid var(--border,#e2e8f0)' }}>
      <div style={{ height:180, background:'var(--hover,#f8fafc)', animation:'pulse 1.5s ease infinite' }}/>
      <div style={{ padding:'1rem' }}>
        <div style={{ height:14, background:'var(--hover,#f8fafc)', borderRadius:6, width:'60%', marginBottom:'0.5rem', animation:'pulse 1.5s ease .1s infinite' }}/>
        <div style={{ height:12, background:'var(--hover,#f8fafc)', borderRadius:6, width:'80%', animation:'pulse 1.5s ease .2s infinite' }}/>
      </div>
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
  </div>
);

export default function LostItemsPage({ showPage }) {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [inputVal, setInputVal]       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch('/api/lost-items');
        const data = await r.json();
        setItems(data.map(i => ({ ...i, type:'lost' })));
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let r = [...items];
    if (activeCategory !== 'All') r = r.filter(i => (i.category||'').toLowerCase() === activeCategory.toLowerCase());
    if (search) r = r.filter(i => [i.title,i.description,i.location].join(' ').toLowerCase().includes(search.toLowerCase()));
    if (dateFrom) r = r.filter(i => i.dateLost && new Date(i.dateLost) >= new Date(dateFrom));
    if (dateTo) { const e = new Date(dateTo); e.setHours(23,59,59,999); r = r.filter(i => i.dateLost && new Date(i.dateLost) <= e); }
    return r;
  }, [items, search, activeCategory, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);

  /* ── Detail view ── */
  if (selectedItem) {
    const st = getSt(selectedItem.status);
    return (
      <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh', padding:'2rem 0 4rem' }}>
        <div className="container" style={{ maxWidth:920 }}>
          <button onClick={()=>setSelectedItem(null)}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--surface,#fff)', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:99, padding:'0.45rem 1.1rem', fontWeight:600, cursor:'pointer', color:'var(--text,#1e293b)', marginBottom:'1.5rem', fontSize:'0.88rem' }}>
            ← Back to Lost Items
          </button>
          <div style={{ background:'var(--surface,#fff)', borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,.09)', border:'1px solid var(--border,#e2e8f0)' }}>
            <div style={{ position:'relative', background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', minHeight:220 }}>
              {selectedItem.imageUrl
                ? <img src={getImageUrl(selectedItem.imageUrl)} alt={selectedItem.title} style={{ width:'100%', height:280, objectFit:'contain', display:'block', padding:16 }}/>
                : <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.5rem' }}><span style={{ fontSize:'4rem' }}>📦</span><span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>No image</span></div>}
              <span style={{ position:'absolute', top:14, left:14, background:st.bg, color:st.c, borderRadius:20, padding:'0.3rem 0.9rem', fontWeight:700, fontSize:'0.8rem' }}>{st.fullText}</span>
            </div>
            <div style={{ padding:'2rem' }}>
              <h2 style={{ fontWeight:900, color:'var(--text,#1e293b)', marginBottom:'0.3rem', fontSize:'1.5rem', letterSpacing:'-0.5px' }}>{selectedItem.title}</h2>
              <span style={{ background:'#f1f5f9', color:'#64748b', padding:'0.22rem 0.7rem', borderRadius:20, fontSize:'0.75rem', fontWeight:600, display:'inline-block', marginBottom:'1.2rem' }}>📂 {capitalizeFirstLetter(selectedItem.category||'Other')}</span>
              {selectedItem.description && <p style={{ color:'var(--text-2,#475569)', lineHeight:1.7, marginBottom:'1.5rem' }}>{selectedItem.description}</p>}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'0.8rem', marginBottom:'1.5rem' }}>
                {[['📍 Location Lost',selectedItem.location],['📅 Date Lost',formatDate(selectedItem.dateLost)],['📞 Contact',selectedItem.contact]].map(([l,v])=>v&&(
                  <div key={l} style={{ background:'var(--hover,#f8fafc)', borderRadius:12, padding:'0.9rem', border:'1px solid var(--border,#e2e8f0)' }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'#94a3b8', marginBottom:'0.2rem' }}>{l}</div>
                    <div style={{ fontWeight:600, color:'var(--text,#1e293b)', fontSize:'0.9rem' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fffbeb', border:'1px solid #fbbf24', borderRadius:12, padding:'1rem 1.2rem' }}>
                <p style={{ color:'#92400e', margin:0, fontSize:'0.875rem', lineHeight:1.6 }}>
                  💡 <strong>Found this item?</strong> Contact the owner directly, or use the{' '}
                  <button onClick={()=>{ setSelectedItem(null); showPage('contact'); }} style={{ background:'none', border:'none', color:'#b45309', fontWeight:700, cursor:'pointer', padding:0, textDecoration:'underline' }}>Complaints page</button>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh' }}>
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#7f1d1d 0%,#991b1b 40%,#dc2626 70%,#ef4444 100%)', color:'#fff', padding:'3.5rem 0 5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', right:'-5%', width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,.1)', filter:'blur(60px)' }}/>
        <div className="container" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <h1 style={{ fontSize:'2.4rem', fontWeight:900, letterSpacing:'-0.5px', marginBottom:'0.4rem' }}>🔴 Lost Items</h1>
          <p style={{ opacity:.85, maxWidth:500, margin:'0 auto' }}>Browse items reported as lost by students on campus</p>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
          <svg viewBox="0 0 1440 56" fill="none" style={{ display:'block' }}><path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="var(--bg,#f8fafc)"/></svg>
        </div>
      </div>

      <div className="container pb-5">
        {/* Search */}
        <div style={{ display:'flex', gap:'0.5rem', maxWidth:560, margin:'1.5rem auto 1rem' }}>
          <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(setSearch(inputVal),setCurrentPage(1))}
            placeholder="Search by title, location…"
            style={{ flex:1, padding:'0.65rem 1rem', borderRadius:99, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.9rem', outline:'none' }}/>
          <button onClick={()=>{ setSearch(inputVal); setCurrentPage(1); }}
            style={{ padding:'0.65rem 1.2rem', borderRadius:99, border:'none', background:'#ef4444', color:'#fff', fontWeight:700, cursor:'pointer' }}>🔍</button>
        </div>

        {/* Category chips */}
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'0.8rem' }}>
          {CATEGORIES.map(cat=>(
            <button key={cat} onClick={()=>{ setActiveCategory(cat); setCurrentPage(1); }}
              style={{ padding:'0.3rem 0.8rem', borderRadius:20, border:'1.5px solid', fontWeight:600, fontSize:'0.78rem', cursor:'pointer', transition:'all .15s',
                background:activeCategory===cat?'#ef4444':'var(--surface,#fff)',
                color:activeCategory===cat?'#fff':'var(--text-2,#64748b)',
                borderColor:activeCategory===cat?'#ef4444':'var(--border,#e2e8f0)' }}>{cat}</button>
          ))}
        </div>

        {/* Date filter */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap', justifyContent:'center', marginBottom:'1.2rem' }}>
          <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-2,#64748b)' }}>📅 Date:</span>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{ padding:'0.35rem 0.7rem', borderRadius:99, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.82rem', outline:'none' }}/>
          <span style={{ color:'#94a3b8' }}>→</span>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{ padding:'0.35rem 0.7rem', borderRadius:99, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.82rem', outline:'none' }}/>
          {(dateFrom||dateTo)&&<button onClick={()=>{setDateFrom('');setDateTo('');}} style={{ background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:99, padding:'0.3rem 0.7rem', fontSize:'0.75rem', fontWeight:700, cursor:'pointer' }}>✕ Clear</button>}
        </div>

        {!loading && <p style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.82rem', marginBottom:'1.2rem' }}>{filtered.length} item{filtered.length!==1?'s':''} found</p>}

        {loading ? (
          <div className="row g-4">{[...Array(6)].map((_,i)=><Skeleton key={i}/>)}</div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>
            <div style={{ fontSize:'3rem', marginBottom:'0.5rem', opacity:.3 }}>🔍</div>
            <p style={{ fontWeight:600 }}>No lost items found</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {paginated.map(item => (
                <ItemCard key={item._id} item={item} showItemDetail={()=>setSelectedItem(item)} statusInfo={getSt(item.status)}/>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display:'flex', gap:'0.4rem', justifyContent:'center', marginTop:'2rem', flexWrap:'wrap' }}>
                <button onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1} style={{ padding:'0.4rem 0.8rem', borderRadius:99, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', cursor:currentPage===1?'not-allowed':'pointer', opacity:currentPage===1?.4:1 }}>‹</button>
                {[...Array(totalPages)].map((_,i)=>(
                  <button key={i} onClick={()=>setCurrentPage(i+1)} style={{ padding:'0.4rem 0.75rem', borderRadius:99, border:'1.5px solid', fontWeight:currentPage===i+1?700:500, background:currentPage===i+1?'#ef4444':'var(--surface,#fff)', color:currentPage===i+1?'#fff':'var(--text-2,#64748b)', borderColor:currentPage===i+1?'#ef4444':'var(--border,#e2e8f0)', cursor:'pointer' }}>{i+1}</button>
                ))}
                <button onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages} style={{ padding:'0.4rem 0.8rem', borderRadius:99, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', cursor:currentPage===totalPages?'not-allowed':'pointer', opacity:currentPage===totalPages?.4:1 }}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
