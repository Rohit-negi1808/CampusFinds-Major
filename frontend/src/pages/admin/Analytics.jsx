import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#06b6d4','#ec4899']
const tip = { background:'var(--surface,#fff)', border:'1px solid var(--border,#e2e8f0)', borderRadius:10, fontSize:'0.82rem', boxShadow:'0 4px 16px rgba(0,0,0,.1)' }

const Card = ({ title, sub, children, span }) => (
  <div style={{ background:'var(--surface,#fff)', borderRadius:16, border:'1.5px solid var(--border,#e2e8f0)', padding:'1.5rem', boxShadow:'0 2px 10px rgba(0,0,0,.04)', gridColumn: span ? `span ${span}` : undefined }}>
    <div style={{ marginBottom:'1.2rem' }}>
      <h4 style={{ fontWeight:800, color:'var(--text,#1e293b)', margin:0, fontSize:'0.95rem' }}>{title}</h4>
      {sub && <p style={{ fontSize:'0.78rem', color:'var(--text-3,#94a3b8)', margin:'0.2rem 0 0' }}>{sub}</p>}
    </div>
    {children}
  </div>
)

const Stat = ({ icon, label, value, color, bg, sub }) => (
  <div style={{ background:'var(--surface,#fff)', borderRadius:14, padding:'1.3rem', border:'1.5px solid var(--border,#e2e8f0)', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color }}/>
    <div style={{ width:42, height:42, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', marginBottom:'0.7rem' }}>{icon}</div>
    <div style={{ fontSize:'2rem', fontWeight:900, color:'var(--text,#1e293b)', lineHeight:1, letterSpacing:'-1px' }}>{value}</div>
    <div style={{ fontSize:'0.73rem', color:'var(--text-3,#94a3b8)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:4 }}>{label}</div>
    {sub && <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:3 }}>{sub}</div>}
  </div>
)

const Empty = ({ h = 220 }) => (
  <div style={{ height:h, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.5rem', color:'#94a3b8' }}>
    <span style={{ fontSize:'2rem', opacity:.3 }}>📊</span>
    <span style={{ fontSize:'0.82rem', fontWeight:600 }}>No data yet</span>
  </div>
)

export default function Analytics({ toast }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const baseUrl = import.meta.env.VITE_API_URL || ''
        const r = await fetch(`${baseUrl}/api/analytics`)
        setData(await r.json())
      } catch { toast?.error('Failed to load analytics') }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
      <div style={{ width:44, height:44, border:'4px solid #e2e8f0', borderTopColor:'#06b6d4', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:'var(--text-3,#94a3b8)', fontWeight:600 }}>Loading analytics…</p>
    </div>
  )

  const {
    summary        = {},
    weeklyData     = [],
    monthlyData    = [],
    categoryData   = [],
    claimStatusData = [],
    foundStatusData = [],
  } = data || {}

  const {
    totalLost      = 0,
    totalFound     = 0,
    totalItems     = 0,
    totalClaims    = 0,
    approvedClaims = 0,
    rejectedClaims = 0,
    pendingClaims  = 0,
    claimedItems   = 0,
    returnedItems  = 0,
    recoveryRate   = 0,
    totalFeedback  = 0,
    pendingFeedback = 0,
  } = summary

  const trendData = monthlyData.map(m => ({ ...m, total: (m.lost||0) + (m.found||0) }))
  const radarData = categoryData.slice(0,6).map(c => ({ subject: c.name, value: c.value }))

  return (
    <div style={{ background:'var(--bg,#f8fafc)', minHeight:'100vh' }}>
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#06b6d4 100%)', color:'#fff', padding:'3rem 0 4.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-20%', right:'-5%', width:280, height:280, borderRadius:'50%', background:'rgba(6,182,212,.2)', filter:'blur(60px)' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.5rem', position:'relative', zIndex:2 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>📊</div>
          <h1 style={{ fontSize:'2.2rem', fontWeight:900, letterSpacing:'-1px', marginBottom:'0.3rem' }}>Analytics & Insights</h1>
          <p style={{ color:'rgba(255,255,255,.65)', margin:0 }}>Real-time platform performance data</p>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, right:0 }}>
          <svg viewBox="0 0 1440 48" fill="none" style={{ display:'block' }}><path d="M0,32 C360,0 1080,48 1440,12 L1440,48 L0,48 Z" fill="#f8fafc"/></svg>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'1.5rem 1.5rem 4rem' }}>

        {/* ── KPI Row 1: Items ────────────────────────────────────── */}
        <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'0.6rem' }}>Items Overview</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
          <Stat icon="📦" label="Total Items"    value={totalItems}   color="#6366f1" bg="#ede9fe"/>
          <Stat icon="🔴" label="Lost Reports"   value={totalLost}    color="#ef4444" bg="#fee2e2"/>
          <Stat icon="🟢" label="Found Items"    value={totalFound}   color="#10b981" bg="#d1fae5"/>
          <Stat icon="📋" label="Claimed"        value={claimedItems} color="#8b5cf6" bg="#ede9fe" sub="found items claimed"/>
          <Stat icon="✅" label="Returned"       value={returnedItems} color="#06b6d4" bg="#cffafe" sub="fully returned"/>
          <Stat icon="📈" label="Recovery Rate"  value={`${recoveryRate}%`} color="#3b82f6" bg="#dbeafe"/>
        </div>

        {/* ── KPI Row 2: Claims ───────────────────────────────────── */}
        <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8', marginBottom:'0.6rem' }}>Claims Overview</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          <Stat icon="🗂️"  label="Total Claims"    value={totalClaims}    color="#f59e0b" bg="#fef3c7"/>
          <Stat icon="✅"  label="Approved"         value={approvedClaims} color="#10b981" bg="#d1fae5"/>
          <Stat icon="❌"  label="Rejected"         value={rejectedClaims} color="#ef4444" bg="#fee2e2"/>
          <Stat icon="⏳"  label="Pending Review"   value={pendingClaims}  color="#f59e0b" bg="#fef3c7"/>
          <Stat icon="💬"  label="Feedback"         value={totalFeedback}  color="#8b5cf6" bg="#ede9fe"/>
          <Stat icon="🔔"  label="Pending Feedback" value={pendingFeedback} color="#ec4899" bg="#fce7f3"/>
        </div>

        {/* ── Charts ──────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.2rem' }}>

          {/* Monthly trend */}
          <Card title="📅 Monthly Trend" sub="Lost, found & claims per month" span={2}>
            {monthlyData.every(m => !m.lost && !m.found && !m.claims)
              ? <Empty h={260}/>
              : <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyData} margin={{ top:5, right:20, left:-10, bottom:0 }}>
                    <defs>
                      <linearGradient id="glost"   x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gfound"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gclaims" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:12, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:12, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip contentStyle={tip}/>
                    <Legend wrapperStyle={{ fontSize:'0.8rem' }}/>
                    <Area type="monotone" dataKey="lost"   name="Lost"   stroke="#ef4444" fill="url(#glost)"   strokeWidth={2} dot={{ r:3 }}/>
                    <Area type="monotone" dataKey="found"  name="Found"  stroke="#10b981" fill="url(#gfound)"  strokeWidth={2} dot={{ r:3 }}/>
                    <Area type="monotone" dataKey="claims" name="Claims" stroke="#6366f1" fill="url(#gclaims)" strokeWidth={2} dot={{ r:3 }}/>
                  </AreaChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* Weekly bar */}
          <Card title="📆 Weekly Activity" sub="Items & claims reported each week">
            {weeklyData.every(w => !w.lost && !w.found && !w.claims)
              ? <Empty/>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyData} margin={{ top:5, right:10, left:-15, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" vertical={false}/>
                    <XAxis dataKey="week" tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip contentStyle={tip}/>
                    <Legend wrapperStyle={{ fontSize:'0.78rem' }}/>
                    <Bar dataKey="lost"   name="Lost"   fill="#ef4444" radius={[4,4,0,0]}/>
                    <Bar dataKey="found"  name="Found"  fill="#10b981" radius={[4,4,0,0]}/>
                    <Bar dataKey="claims" name="Claims" fill="#6366f1" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* Claim status pie */}
          <Card title="📋 Claim Status" sub="Distribution of all claims">
            {claimStatusData.length === 0
              ? <Empty/>
              : <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={claimStatusData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {claimStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={tip}/>
                    <Legend wrapperStyle={{ fontSize:'0.78rem' }}/>
                  </PieChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* Found item status pie */}
          <Card title="🟢 Found Items Status" sub="Available vs claimed vs returned">
            {foundStatusData.length === 0
              ? <Empty/>
              : <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={foundStatusData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {foundStatusData.map((_, i) => <Cell key={i} fill={['#10b981','#8b5cf6','#06b6d4'][i]}/>)}
                    </Pie>
                    <Tooltip contentStyle={tip}/>
                    <Legend wrapperStyle={{ fontSize:'0.78rem' }}/>
                  </PieChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* Category breakdown */}
          <Card title="📂 Items by Category" sub="Most reported categories" span={2}>
            {categoryData.length === 0
              ? <Empty/>
              : <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData.slice(0,10)} layout="vertical" margin={{ top:0, right:20, left:10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" horizontal={false}/>
                    <XAxis type="number" tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false} width={80}/>
                    <Tooltip contentStyle={tip}/>
                    <Bar dataKey="value" name="Items" radius={[0,4,4,0]}>
                      {categoryData.slice(0,10).map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </Card>

          {/* Radar — category distribution */}
          {radarData.length >= 3 && (
            <Card title="🕸️ Category Radar" sub="Relative category distribution">
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border,#e2e8f0)"/>
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }}/>
                  <Radar name="Items" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2}/>
                  <Tooltip contentStyle={tip}/>
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Total volume trend */}
          <Card title="📈 Total Volume Trend" sub="Combined lost + found each month">
            {trendData.every(m => !m.total)
              ? <Empty h={240}/>
              : <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData} margin={{ top:5, right:20, left:-10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:'var(--text-3,#94a3b8)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip contentStyle={tip}/>
                    <Line type="monotone" dataKey="total" name="Total Items" stroke="#f59e0b" strokeWidth={2.5} dot={{ r:4, fill:'#f59e0b' }} activeDot={{ r:6 }}/>
                  </LineChart>
                </ResponsiveContainer>
            }
          </Card>

        </div>
      </div>
    </div>
  )
}