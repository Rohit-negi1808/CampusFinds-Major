import React, { useState } from 'react'
import LandingPage from '../pages/landing/LandingPage.jsx'
import AppUser from '../pages/user/AppUser.jsx'
import AdminApp from '../pages/admin/AdminApp.jsx'
import LoginPage from '../pages/login/LoginPage.jsx'
import RegisterPage from '../pages/login/RegisterPage.jsx'

const AuthModal = ({ children, onClose }) => (
  <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(15,12,41,.78)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
    <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:420 }}>{children}</div>
  </div>
)

export default function AppRouter() {
  const [screen, setScreen] = useState('landing')
  const [loginType, setLoginType] = useState('user')
  const [showReg, setShowReg] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const openAuth = () => { setScreen('auth'); setError(null) }
  const closeAuth = () => { if (screen === 'auth') setScreen('landing') }

  const handleLogin = async () => {
    setError(null)
    try {
      const endpoint = loginType === 'admin' ? '/api/admin/login' : '/api/users/login'
      const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid credentials')
      // Store JWT
      if (data.token) localStorage.setItem('cf-token', data.token)
      if (loginType === 'user' && data.user) {
        if (data.user.status === 'suspended') { setError('🚫 Account suspended. Contact Student Care.'); return }
        setCurrentUser(data.user); setScreen('app-user')
      } else if (loginType === 'admin' && data.admin) {
        setCurrentUser(data.admin); setScreen('app-admin')
      } else throw new Error('Unexpected response')
    } catch (err) { setError(err.message) }
  }

  const handleLogout = () => {
    localStorage.removeItem('cf-token')
    setCurrentUser(null); setScreen('landing')
    setEmail(''); setPassword(''); setError(null); setShowReg(false)
  }

  if (screen === 'app-admin') return <AdminApp onLogout={handleLogout}/>
  if (screen === 'app-user' && currentUser) return <AppUser currentUser={currentUser} onLogout={handleLogout}/>

  return (
    <>
      <LandingPage onGetStarted={openAuth}/>
      {screen === 'auth' && (
        <AuthModal onClose={closeAuth}>
          <div style={{ background:'#fff', borderRadius:22, padding:'2rem', boxShadow:'0 24px 60px rgba(0,0,0,.3)' }}>
            <button onClick={closeAuth} style={{ float:'right', background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer', color:'#94a3b8', marginBottom:'0.5rem' }}>×</button>
            {error && <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1rem', color:'#991b1b', fontSize:'0.85rem', fontWeight:500 }}>⚠️ {error}</div>}
            {!showReg && (
              <>
                <div style={{ textAlign:'center', marginBottom:'1.2rem' }}>
                  <div style={{ fontSize:'2rem', marginBottom:'0.3rem' }}>🔍</div>
                  <h3 style={{ color:'#1e293b', fontWeight:800, marginBottom:0, fontSize:'1.3rem' }}>Welcome to CampusFinds</h3>
                  <p style={{ color:'#94a3b8', fontSize:'0.83rem', marginTop:'0.3rem' }}>Sign in to report, browse, and claim items</p>
                </div>
                <div style={{ display:'flex', borderRadius:12, overflow:'hidden', border:'1.5px solid #e2e8f0', marginBottom:'1.5rem' }}>
                  {[['👤 Student','user'],['🛡️ Admin','admin']].map(([l,t]) => (
                    <button key={t} onClick={()=>setLoginType(t)} style={{ flex:1, padding:'0.72rem', border:'none', cursor:'pointer', fontWeight:700, fontSize:'0.88rem', transition:'all .2s', background:loginType===t?(t==='admin'?'linear-gradient(135deg,#10b981,#059669)':'linear-gradient(135deg,#6366f1,#8b5cf6)'):'#f8fafc', color:loginType===t?'#fff':'#64748b' }}>{l}</button>
                  ))}
                </div>
              </>
            )}
            {showReg ? <RegisterPage showPage={p=>p==='login'&&setShowReg(false)}/> : <LoginPage handleLogin={handleLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loginType={loginType} setShowRegister={setShowReg}/>}
          </div>
        </AuthModal>
      )}
    </>
  )
}
