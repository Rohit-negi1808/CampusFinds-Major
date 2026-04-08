import React, { useState } from 'react'

const CU_DOMAINS = ['cuchd.in', 'chandigarhuniversity.ac.in', 'cu.ac.in']
const isCUEmail = e => { const d = e.split('@')[1]?.toLowerCase(); return CU_DOMAINS.some(x => d === x || d?.endsWith('.' + x)) }
const isCUId    = id => /^[A-Za-z0-9]{6,15}$/.test(id?.trim() || '')

const inp = (err, focused) => ({
  width:'100%', padding:'0.65rem 1rem', borderRadius:10, fontFamily:'inherit',
  border: `1.5px solid ${err ? '#ef4444' : focused ? '#6366f1' : '#e2e8f0'}`,
  background: err ? '#fff5f5' : '#f8fafc',
  color:'#1e293b', fontSize:'0.9rem', outline:'none', transition:'border-color .2s, background .2s'
})

const lbl = { fontSize:'0.73rem', fontWeight:700, textTransform:'uppercase',
  letterSpacing:'0.05em', color:'#64748b', display:'block', marginBottom:'0.3rem' }

export default function RegisterPage({ showPage }) {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'', studentId:'' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const foc = k => () => setFocused(k)
  const blr = () => setFocused('')

  const validate = () => {
    const errs = {}
    if (!form.name.trim())              errs.name      = 'Full name is required'
    if (!isCUId(form.studentId))        errs.studentId = 'Enter your CU Student ID — e.g. 12ABC12345'
    if (!isCUEmail(form.email))         errs.email     = 'Use your CU email — e.g. 12ABC12345@cuchd.in'
    if (form.password.length < 6)       errs.password  = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) errs.confirm   = 'Passwords do not match'
    return errs
  }

  const submit = async () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    try {
      const baseUrl = process.env.REACT_APP_API_URL || ''
      const r = await fetch(`${baseUrl}/api/users/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:form.name, email:form.email, password:form.password, studentId:form.studentId })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Registration failed')
      setErrors({ _success: 'Account created! Please sign in.' })
      setTimeout(() => showPage('login'), 1500)
    } catch(err) {
      // Normalize any stale backend message referencing old domain
      setErrors({ _api: err.message?.replace(/cumail\.in/gi, 'cuchd.in') })
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:'1.2rem' }}>
        <div style={{ fontSize:'1.8rem', marginBottom:'0.3rem' }}>🎓</div>
        <h3 style={{ fontWeight:900, color:'#1e293b', fontSize:'1.1rem', margin:0 }}>Create Student Account</h3>
        <p style={{ color:'#94a3b8', fontSize:'0.78rem', marginTop:'0.2rem' }}>Only Chandigarh University students can register</p>
      </div>

      {errors._api     && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'0.6rem 0.9rem', marginBottom:'0.8rem', color:'#991b1b', fontSize:'0.82rem', fontWeight:500 }}>⚠️ {errors._api}</div>}
      {errors._success && <div style={{ background:'#d1fae5', border:'1px solid #6ee7b7', borderRadius:10, padding:'0.6rem 0.9rem', marginBottom:'0.8rem', color:'#065f46', fontSize:'0.82rem', fontWeight:600 }}>✅ {errors._success}</div>}

      <div style={{ background:'linear-gradient(135deg,#ede9fe,#dbeafe)', border:'1px solid #c7d2fe', borderRadius:10, padding:'0.55rem 0.9rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
        <span>🏛️</span>
        <div>
          <div style={{ fontSize:'0.74rem', fontWeight:700, color:'#4338ca' }}>CU Students Only</div>
          <div style={{ fontSize:'0.69rem', color:'#6366f1' }}>Use your @cuchd.in institutional email</div>
        </div>
      </div>

      {/* Full Name */}
      <div style={{ marginBottom:'0.8rem' }}>
        <label style={lbl}>Full Name</label>
        <input type="text" placeholder="Your full name" value={form.name}
          onChange={set('name')} onFocus={foc('name')} onBlur={blr}
          style={inp(errors.name, focused==='name')}/>
        {errors.name && <p style={{ fontSize:'0.72rem', color:'#ef4444', margin:'0.15rem 0 0' }}>⚠ {errors.name}</p>}
      </div>

      {/* Student ID */}
      <div style={{ marginBottom:'0.8rem' }}>
        <label style={lbl}>CU Student ID</label>
        <input type="text" placeholder="e.g. 12ABC12345" value={form.studentId}
          onChange={set('studentId')} onFocus={foc('studentId')} onBlur={blr}
          style={inp(errors.studentId, focused==='studentId')}/>
        {errors.studentId
          ? <p style={{ fontSize:'0.72rem', color:'#ef4444', margin:'0.15rem 0 0' }}>⚠ {errors.studentId}</p>
          : <p style={{ fontSize:'0.71rem', color:'#94a3b8', margin:'0.15rem 0 0' }}>Your official CU enrollment ID</p>}
      </div>

      {/* CU Email */}
      <div style={{ marginBottom:'0.8rem' }}>
        <label style={lbl}>CU Email</label>
        <input type="email" placeholder="12ABC12345@cuchd.in" value={form.email}
          onChange={set('email')} onFocus={foc('email')} onBlur={blr}
          style={inp(errors.email, focused==='email')}/>
        {errors.email
          ? <p style={{ fontSize:'0.72rem', color:'#ef4444', margin:'0.15rem 0 0' }}>⚠ {errors.email}</p>
          : <p style={{ fontSize:'0.71rem', color:'#94a3b8', margin:'0.15rem 0 0' }}>Must be @cuchd.in or @chandigarhuniversity.ac.in</p>}
      </div>

      {/* Password */}
      <div style={{ marginBottom:'0.8rem' }}>
        <label style={lbl}>Password</label>
        <input type="password" placeholder="Min 6 characters" value={form.password}
          onChange={set('password')} onFocus={foc('password')} onBlur={blr}
          style={inp(errors.password, focused==='password')}/>
        {errors.password && <p style={{ fontSize:'0.72rem', color:'#ef4444', margin:'0.15rem 0 0' }}>⚠ {errors.password}</p>}
      </div>

      {/* Confirm */}
      <div style={{ marginBottom:'1rem' }}>
        <label style={lbl}>Confirm Password</label>
        <input type="password" placeholder="Repeat password" value={form.confirm}
          onChange={set('confirm')} onFocus={foc('confirm')} onBlur={blr}
          style={inp(errors.confirm, focused==='confirm')}/>
        {errors.confirm && <p style={{ fontSize:'0.72rem', color:'#ef4444', margin:'0.15rem 0 0' }}>⚠ {errors.confirm}</p>}
      </div>

      <button onClick={submit} disabled={loading}
        style={{ width:'100%', padding:'0.8rem', borderRadius:12, border:'none',
          background: loading ? '#94a3b8' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color:'#fff', fontWeight:700, fontSize:'0.95rem',
          cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? '⏳ Creating Account…' : '🎓 Create Account'}
      </button>

      <p style={{ textAlign:'center', fontSize:'0.82rem', color:'#64748b', marginTop:'1rem', marginBottom:0 }}>
        Already have an account?{' '}
        <button onClick={() => showPage('login')}
          style={{ background:'none', border:'none', color:'#6366f1', fontWeight:700, cursor:'pointer', padding:0 }}>
          Sign In
        </button>
      </p>
    </div>
  )
}