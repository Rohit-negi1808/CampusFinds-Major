import React from 'react';

const AdminFooter = () => (
  <footer
    style={{
      background: '#0f172a',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      marginTop: 'auto',
      padding: '1.4rem 1.5rem',
      color: '#94a3b8'
    }}
  >
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.6rem'
      }}
    >
      
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.9rem' }}>
          🛡️ CampusFinds Admin
        </span>
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          Control • Monitor • Manage
        </span>
      </div>

      {/* Center */}
      <span style={{ fontSize: '0.75rem' }}>
        © {new Date().getFullYear()} CampusFinds · Chandigarh University · Admin Dashboard
      </span>

      {/* Right */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: '#22c55e',
          fontWeight: 600
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 8px #22c55e'
          }}
        />
        System running smoothly
      </span>

    </div>
  </footer>
);

export default AdminFooter;