import React, { useState, useCallback } from 'react'

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="cf-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`cf-toast cf-toast-${t.type}`}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icons[t.type]}</span>
          <div style={{ flex: 1 }}>
            {t.title && <div style={{ fontWeight: 700, marginBottom: '2px', fontSize: '0.85rem' }}>{t.title}</div>}
            <div style={{ fontSize: '0.83rem', opacity: 0.85 }}>{t.message}</div>
          </div>
          <button onClick={() => removeToast(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '1.1rem', flexShrink: 0, padding: 0 }}>×</button>
        </div>
      ))}
    </div>
  )
}

let toastId = 0
export function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, type = 'info', title = '') => {
    const id = ++toastId
    setToasts(p => [...p, { id, message, type, title }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])
  const toast = {
    success: (m, t) => add(m, 'success', t),
    error:   (m, t) => add(m, 'error', t),
    warning: (m, t) => add(m, 'warning', t),
    info:    (m, t) => add(m, 'info', t),
  }
  return { toasts, toast, removeToast: (id) => setToasts(p => p.filter(t => t.id !== id)) }
}
