import React, { useState, useEffect, useRef } from 'react'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import Toast, { useToast } from '../../components/Toast.jsx'
import HomePage from './HomePage.jsx'
import LostItemsPage from './LostItemsPage.jsx'
import FoundItemsPage from './FoundItemsPage.jsx'
import ReportItemPage from './ReportItemPage.jsx'
import ContactPage from './ContactPage.jsx'

// Swipe-back hook
function useSwipeBack(onBack, enabled = true) {
  const startX = useRef(null)
  useEffect(() => {
    if (!enabled) return
    const onStart = e => { startX.current = e.touches[0].clientX }
    const onEnd = e => {
      if (startX.current === null) return
      const dx = e.changedTouches[0].clientX - startX.current
      if (dx > 70 && startX.current < 60) onBack()
      startX.current = null
    }
    window.addEventListener('touchstart', onStart, { passive:true })
    window.addEventListener('touchend', onEnd, { passive:true })
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd) }
  }, [onBack, enabled])
}

export default function AppUser({ currentUser, onLogout }) {
  const [page, setPage]         = useState('home')
  const [history, setHistory]   = useState(['home'])
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('cf-theme') === 'dark')
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('cf-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const showPage = (id) => {
    setPage(id)
    setHistory(h => [...h.slice(-9), id])
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  const goBack = () => {
    if (history.length <= 1) return
    const prev = history[history.length - 2]
    setHistory(h => h.slice(0, -1))
    setPage(prev)
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  useSwipeBack(goBack, history.length > 1)

  const renderPage = () => {
    switch (page) {
      case 'home':       return <HomePage showPage={showPage}/>
      case 'lostItems':  return <LostItemsPage showPage={showPage}/>
      case 'foundItems': return <FoundItemsPage showPage={showPage} currentUser={currentUser}/>
      case 'report':     return currentUser ? <ReportItemPage showPage={showPage} currentUser={currentUser} toast={toast}/> : <HomePage showPage={showPage}/>
      case 'contact':    return <ContactPage currentUser={currentUser} toast={toast}/>
      default:           return <HomePage showPage={showPage}/>
    }
  }

  return (
    <>
      <Header showPage={showPage} currentPage={page} userName={currentUser?.name||'Guest'} userEmail={currentUser?.email} onLogout={onLogout} darkMode={darkMode} toggleDarkMode={()=>setDarkMode(p=>!p)}/>
      <div style={{ minHeight:'calc(100vh - 72px)' }}>{renderPage()}</div>
      <Footer showPage={showPage}/>
      <Toast toasts={toasts} removeToast={removeToast}/>
    </>
  )
}
