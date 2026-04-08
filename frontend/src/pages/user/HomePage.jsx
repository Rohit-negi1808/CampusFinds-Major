import React, { useState, useEffect, useRef } from 'react';
import ItemCard from '../../components/ItemCard.jsx';
import SuccessModal from '../../components/SuccessModal.jsx';
import { formatDate, getImageUrl, capitalizeFirstLetter } from '../../utils';

const STATUS_MAP = {
  found:    { bg:'#d1fae5', c:'#065f46', t:'🟢 Found'    },
  claimed:  { bg:'#ede9fe', c:'#5b21b6', t:'📋 Claimed'  },
  returned: { bg:'#dbeafe', c:'#1e40af', t:'✅ Returned' },
};
const getStatusInfo = st => STATUS_MAP[st?.toLowerCase()] || STATUS_MAP.found;

const Stars = ({ n }) => (
  <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i<=n ? '#f59e0b' : '#e2e8f0', fontSize:'1rem' }}>★</span>)}</span>
);

const Skeleton = () => (
  <div className="col-md-4">
    <div style={{ background:'var(--surface,#fff)', borderRadius:16, padding:'1rem', border:'1px solid var(--border,#e2e8f0)' }}>
      <div style={{ background:'var(--hover,#f8fafc)', borderRadius:10, height:180, marginBottom:'0.8rem', animation:'pulse 1.5s ease infinite' }}/>
      <div style={{ background:'var(--hover,#f8fafc)', borderRadius:6, height:16, width:'60%', marginBottom:'0.5rem', animation:'pulse 1.5s ease .1s infinite' }}/>
      <div style={{ background:'var(--hover,#f8fafc)', borderRadius:6, height:14, width:'80%', animation:'pulse 1.5s ease .2s infinite' }}/>
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
  </div>
);

export default function HomePage({ showPage }) {
  const [items, setItems]               = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimData, setClaimData]       = useState({ name:'', email:'', contact:'', message:'' });
  const [loading, setLoading]           = useState(true);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [claimError, setClaimError]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [stories, setStories]           = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [itemsRes, storiesRes] = await Promise.all([fetch('/api/found-items'), fetch('/api/feedback/public')]);
        const itemsData = await itemsRes.json();
        setItems(itemsData.sort((a,b)=>new Date(b.dateFound)-new Date(a.dateFound)).slice(0,3).map(i=>({...i,type:'found'})));
        if (storiesRes.ok) setStories((await storiesRes.json()).slice(0,6));
      } catch(e){ console.error(e); }
      finally { setLoading(false); setStoriesLoading(false); }
    })();
  }, []);

  const submitClaim = async () => {
    setClaimError('');
    if (!claimData.name || !claimData.contact || !claimData.message)
      return setClaimError('Please fill Name, Contact and Message.');
    setSubmitting(true);
    try {
      const res = await fetch('/api/claims', { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ itemId:selectedItem._id, itemType:'found', claimantName:claimData.name, claimantEmail:claimData.email||'', contact:claimData.contact, message:claimData.message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error||json.message||'Server error');
      setShowClaimForm(false); setClaimData({ name:'',email:'',contact:'',message:'' }); setShowSuccess(true);
    } catch(err){ setClaimError(err.message||'Failed. Try again.'); }
    finally { setSubmitting(false); }
  };

  if (selectedItem) {
    const st = selectedItem.status?.toLowerCase() || 'found';
    const ss = STATUS_MAP[st] || STATUS_MAP.found;
    return (
      <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh', padding:'2rem 0 4rem' }}>
        <div className="container" style={{ maxWidth:940 }}>
          <button onClick={()=>{ setSelectedItem(null); setShowClaimForm(false); setClaimData({name:'',email:'',contact:'',message:''}); }}
            style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--surface,#fff)', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:10, padding:'0.5rem 1.2rem', fontWeight:600, cursor:'pointer', color:'var(--text,#1e293b)', marginBottom:'1.5rem', fontSize:'0.9rem' }}>
            ← Back
          </button>
          <div style={{ background:'var(--surface,#fff)', borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,.09)', border:'1px solid var(--border,#e2e8f0)' }}>
            <div style={{ position:'relative', background:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', minHeight:240 }}>
              {selectedItem.imageUrl
                ? <img src={getImageUrl(selectedItem.imageUrl)} alt={selectedItem.title} style={{ width:'100%', height:280, objectFit:'contain', display:'block', padding:16 }}/>
                : <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.5rem' }}><span style={{ fontSize:'4rem' }}>📦</span><span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>No image</span></div>}
              <span style={{ position:'absolute', top:14, left:14, background:ss.bg, color:ss.c, borderRadius:20, padding:'0.3rem 0.9rem', fontWeight:700, fontSize:'0.8rem' }}>{ss.t}</span>
            </div>
            <div style={{ padding:'2rem' }}>
              <h2 style={{ fontWeight:900, color:'var(--text,#1e293b)', marginBottom:'0.4rem', fontSize:'1.6rem', letterSpacing:'-0.5px' }}>{selectedItem.title}</h2>
              <span style={{ background:'#f1f5f9', color:'#64748b', padding:'0.25rem 0.8rem', borderRadius:20, fontSize:'0.78rem', fontWeight:600, display:'inline-block', marginBottom:'1.2rem' }}>📂 {capitalizeFirstLetter(selectedItem.category||'Other')}</span>
              {selectedItem.description && <p style={{ color:'var(--text-2,#64748b)', lineHeight:1.7, marginBottom:'1.5rem' }}>{selectedItem.description}</p>}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'0.8rem', marginBottom:'1.5rem' }}>
                {[['📍 Location Found',selectedItem.location],['📅 Date Found',formatDate(selectedItem.dateFound)],['📞 Contact',selectedItem.contact]].map(([lbl,val]) => val && (
                  <div key={lbl} style={{ background:'var(--hover,#f8fafc)', borderRadius:12, padding:'0.9rem', border:'1px solid var(--border,#e2e8f0)' }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-3,#94a3b8)', marginBottom:'0.25rem' }}>{lbl}</div>
                    <div style={{ fontWeight:600, color:'var(--text,#1e293b)', fontSize:'0.9rem' }}>{val}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{ setShowClaimForm(p=>!p); setClaimError(''); }}
                style={{ width:'100%', padding:'0.85rem', borderRadius:12, border:'none', fontWeight:700, fontSize:'1rem', cursor:'pointer', marginBottom:'0.5rem', transition:'all .2s', background:showClaimForm?'#f1f5f9':'linear-gradient(135deg,#10b981,#059669)', color:showClaimForm?'#64748b':'#fff' }}>
                {showClaimForm ? '✕ Cancel' : '🙋 Claim This Item'}
              </button>
              {showClaimForm && (
                <div style={{ background:'var(--hover,#f8fafc)', borderRadius:16, padding:'1.5rem', border:'1px solid var(--border,#e2e8f0)', marginTop:'0.5rem' }}>
                  <h5 style={{ fontWeight:800, color:'var(--text,#1e293b)', marginBottom:'0.6rem', fontSize:'1rem' }}>🙋 Submit Claim</h5>
                  {claimError && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'0.7rem 1rem', marginBottom:'0.8rem', color:'#991b1b', fontSize:'0.83rem', fontWeight:500 }}>⚠️ {claimError}</div>}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem', marginBottom:'0.7rem' }}>
                    {[['Name *','name','text','Full name'],['Phone *','contact','text','Contact number']].map(([lbl,key,type,ph])=>(
                      <div key={key}><label style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', display:'block', marginBottom:'0.25rem' }}>{lbl}</label>
                        <input type={type} placeholder={ph} value={claimData[key]} onChange={e=>setClaimData(p=>({...p,[key]:e.target.value}))} style={{ width:'100%', padding:'0.6rem 0.9rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem', outline:'none', fontFamily:'inherit' }}/></div>
                    ))}
                  </div>
                  <div style={{ marginBottom:'0.7rem' }}>
                    <label style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', display:'block', marginBottom:'0.25rem' }}>Email (optional)</label>
                    <input type="email" placeholder="your@email.com" value={claimData.email} onChange={e=>setClaimData(p=>({...p,email:e.target.value}))} style={{ width:'100%', padding:'0.6rem 0.9rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem', outline:'none', fontFamily:'inherit' }}/>
                  </div>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', color:'#94a3b8', display:'block', marginBottom:'0.25rem' }}>Proof of Ownership *</label>
                    <textarea placeholder="Describe why this is yours..." rows={3} value={claimData.message} onChange={e=>setClaimData(p=>({...p,message:e.target.value}))} style={{ width:'100%', padding:'0.6rem 0.9rem', borderRadius:9, border:'1.5px solid var(--border,#e2e8f0)', background:'var(--surface,#fff)', color:'var(--text,#1e293b)', fontSize:'0.88rem', outline:'none', resize:'vertical', fontFamily:'inherit' }}/>
                  </div>
                  <button onClick={submitClaim} disabled={submitting} style={{ width:'100%', padding:'0.85rem', borderRadius:12, border:'none', background:submitting?'#94a3b8':'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontWeight:700, fontSize:'1rem', cursor:submitting?'not-allowed':'pointer' }}>
                    {submitting ? '⏳ Submitting…' : '✅ Submit Claim'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <SuccessModal show={showSuccess} onClose={()=>{ setShowSuccess(false); setSelectedItem(null); }} isClaim={true} claimData={claimData}/>
      </div>
    );
  }

  return (
    <div style={{ background:'var(--bg,#f8fafc)' }}>

      {/* Hero */}
      <section style={{ background:'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#7c3aed 100%)', color:'#fff', padding:'4rem 0 6rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', right:'-5%', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.08)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'5%', width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,.06)', filter:'blur(50px)' }}/>
        <div className="container" style={{ position:'relative', zIndex:2, maxWidth:640 }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.8rem' }}>🔍</div>
          <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, marginBottom:'0.8rem', letterSpacing:'-1px', lineHeight:1.15 }}>Lost something on campus?</h1>
          <p style={{ opacity:.85, marginBottom:'2rem', fontSize:'1.05rem', lineHeight:1.6 }}>CampusFinds connects you with fellow students to recover your belongings fast.</p>
          <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <button onClick={()=>showPage('report')} style={{ background:'#fff', color:'#6366f1', border:'none', borderRadius:12, padding:'0.85rem 1.8rem', fontWeight:800, fontSize:'0.95rem', cursor:'pointer', boxShadow:'0 6px 20px rgba(0,0,0,.15)', transition:'transform .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
              📝 Report an Item
            </button>
            <button onClick={()=>showPage('foundItems')} style={{ background:'rgba(255,255,255,.15)', color:'#fff', border:'1.5px solid rgba(255,255,255,.35)', borderRadius:12, padding:'0.85rem 1.8rem', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', backdropFilter:'blur(4px)', transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.22)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}>
              🔎 Browse Found Items
            </button>
          </div>
        </div>
        <svg style={{ position:'absolute', bottom:0, left:0, right:0, display:'block' }} viewBox="0 0 1440 56" fill="none">
          <path d="M0,40 C360,0 1080,56 1440,16 L1440,56 L0,56 Z" fill="var(--bg,#f8fafc)"/>
        </svg>
      </section>

      {/* How It Works */}
      <section style={{ padding:'4rem 0', background:'var(--surface,#fff)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <p style={{ color:'#6366f1', fontWeight:700, fontSize:'0.73rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.4rem' }}>Simple process</p>
            <h2 style={{ fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:900, color:'var(--text,#1e293b)', letterSpacing:'-0.5px' }}>How It Works</h2>
          </div>
          <div className="row g-4">
            {[
              { step:'01', icon:'🚨', bg:'#fee2e2', title:'Report Lost Item', desc:'Fill a quick form — title, category, location and a photo. Done in under 2 minutes.', color:'#ef4444' },
              { step:'02', icon:'🔍', bg:'#dbeafe', title:'Browse Found Items', desc:'Search items others found on campus. Filter by category, date or keyword.', color:'#3b82f6' },
              { step:'03', icon:'🤝', bg:'#d1fae5', title:'Claim Your Item', desc:"Found your item? Submit a claim. Admin verifies and you pick it up from Student Care.", color:'#10b981' },
            ].map(({ step, icon, bg, title, desc, color }) => (
              <div className="col-md-4" key={step}>
                <div style={{ background:'var(--bg,#f8fafc)', borderRadius:18, padding:'1.8rem', textAlign:'center', border:'1.5px solid var(--border,#e2e8f0)', position:'relative', overflow:'hidden', height:'100%', transition:'all .25s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.09)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                  <span style={{ position:'absolute', top:'0.8rem', right:'1rem', fontSize:'2rem', fontWeight:900, color:'var(--border,#e2e8f0)', lineHeight:1 }}>{step}</span>
                  <div style={{ width:60, height:60, borderRadius:16, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.7rem', margin:'0 auto 1rem' }}>{icon}</div>
                  <h5 style={{ fontWeight:800, marginBottom:'0.5rem', color:'var(--text,#1e293b)' }}>{title}</h5>
                  <p style={{ color:'var(--text-2,#64748b)', fontSize:'0.875rem', lineHeight:1.65, margin:0 }}>{desc}</p>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:color, borderRadius:'0 0 18px 18px', opacity:.5 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Found */}
      <section style={{ padding:'4rem 0', background:'var(--bg,#f8fafc)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
            <div>
              <h2 style={{ fontWeight:900, color:'var(--text,#1e293b)', fontSize:'clamp(1.2rem,3vw,1.6rem)', letterSpacing:'-0.5px', margin:0 }}>Recently Found 🟢</h2>
              <p style={{ color:'var(--text-2,#64748b)', fontSize:'0.875rem', marginTop:'0.25rem', marginBottom:0 }}>Latest items turned in by fellow students</p>
            </div>
            <button onClick={()=>showPage('foundItems')} style={{ background:'var(--surface,#fff)', color:'#6366f1', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:20, padding:'0.45rem 1.1rem', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', transition:'border-color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#6366f1'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border,#e2e8f0)'}>
              View All →
            </button>
          </div>
          <div className="row g-4">
            {loading ? [0,1,2].map(i=><Skeleton key={i}/>)
              : items.length > 0 ? items.map(item => {
                  const si = getStatusInfo(item.status);
                  return <ItemCard key={item._id} item={item} showItemDetail={()=>setSelectedItem(item)} statusInfo={{ text:si.t, badgeClass:'bg-success', fullText:si.t }}/>;
                })
              : <div className="col-12" style={{ textAlign:'center', padding:'3rem', color:'var(--text-2,#64748b)' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'0.5rem', opacity:.3 }}>📭</div>
                  <p style={{ margin:0 }}>No recent found items. Check back later!</p>
                </div>
            }
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section style={{ padding:'3rem 0', background:'var(--surface,#fff)' }}>
        <div className="container">
          <h2 style={{ fontWeight:900, color:'var(--text,#1e293b)', fontSize:'clamp(1.2rem,3vw,1.5rem)', letterSpacing:'-0.5px', marginBottom:'1.5rem', textAlign:'center' }}>What do you need?</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1rem', maxWidth:800, margin:'0 auto' }}>
            {[
              { icon:'🔴', title:"I lost something",  desc:"Report a lost item so others can help.", page:'report', bg:'#fee2e2', accent:'#ef4444' },
              { icon:'🟢', title:"I found something", desc:"Post a found item so the owner can claim.", page:'report', bg:'#d1fae5', accent:'#10b981' },
              { icon:'🔎', title:"Browse found items", desc:"Look through all found items on campus.", page:'foundItems', bg:'#dbeafe', accent:'#3b82f6' },
              { icon:'💬', title:"Complaints & Feedback", desc:"Submit a complaint or share your story.", page:'contact', bg:'#fef3c7', accent:'#f59e0b' },
            ].map(card => (
              <div key={card.title} onClick={()=>showPage(card.page)} style={{ background:card.bg, borderRadius:18, padding:'1.5rem', cursor:'pointer', border:'1.5px solid transparent', transition:'all .22s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 10px 28px ${card.accent}22`; e.currentTarget.style.borderColor=card.accent; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor='transparent'; }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{card.icon}</div>
                <h5 style={{ fontWeight:800, color:'#1e293b', marginBottom:'0.3rem', fontSize:'0.95rem' }}>{card.title}</h5>
                <p style={{ color:'#64748b', fontSize:'0.82rem', lineHeight:1.5, margin:0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Success Stories from API */}
      <section style={{ padding:'4rem 0', background:'var(--bg,#f8fafc)' }}>
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'2rem', flexWrap:'wrap', gap:'0.5rem' }}>
            <div>
              <h2 style={{ fontWeight:900, color:'var(--text,#1e293b)', fontSize:'clamp(1.2rem,3vw,1.6rem)', letterSpacing:'-0.5px', margin:0 }}>Success Stories 💚</h2>
              <p style={{ color:'var(--text-2,#64748b)', fontSize:'0.875rem', marginTop:'0.25rem', marginBottom:0 }}>Real feedback from real students — not made up!</p>
            </div>
            <button onClick={()=>showPage('contact')} style={{ background:'var(--surface,#fff)', color:'#10b981', border:'1.5px solid var(--border,#e2e8f0)', borderRadius:20, padding:'0.45rem 1.1rem', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
              Share Your Story →
            </button>
          </div>
          {storiesLoading ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-2,#64748b)' }}>Loading stories…</div>
          ) : stories.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-2,#64748b)' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.5rem', opacity:.3 }}>💬</div>
              <p>No stories yet. Be the first to share yours!</p>
              <button onClick={()=>showPage('contact')} style={{ background:'#10b981', color:'#fff', border:'none', borderRadius:10, padding:'0.65rem 1.5rem', fontWeight:700, cursor:'pointer', marginTop:'0.5rem' }}>Share My Story ⭐</button>
            </div>
          ) : (
            <div className="row g-4">
              {stories.map((story,i) => (
                <div className="col-md-4" key={story._id||i}>
                  <div style={{ background:'var(--surface,#fff)', borderRadius:18, padding:'1.8rem', border:'1.5px solid var(--border,#e2e8f0)', height:'100%', position:'relative', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.04)', transition:'all .25s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(0,0,0,.09)'; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)'; }}>
                    <div style={{ fontSize:'3.5rem', color:'var(--border,#f1f5f9)', position:'absolute', top:8, left:14, lineHeight:1, fontFamily:'Georgia,serif', fontWeight:900, userSelect:'none' }}>"</div>
                    <div style={{ marginBottom:'0.8rem', paddingTop:'0.5rem' }}>
                      <Stars n={story.rating}/>
                    </div>
                    <p style={{ color:'var(--text-2,#64748b)', lineHeight:1.75, fontSize:'0.875rem', marginBottom:'1.5rem' }}>{story.message}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:'#e0e7ff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.8rem', color:'#4338ca', flexShrink:0 }}>{story.name?.[0]?.toUpperCase()||'?'}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text,#1e293b)' }}>{story.name}</div>
                        {story.itemRecovered && <div style={{ fontSize:'0.75rem', color:'var(--text-3,#94a3b8)' }}>✅ {story.itemRecovered}</div>}
                      </div>
                      <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--text-3,#94a3b8)', whiteSpace:'nowrap' }}>{new Date(story.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
