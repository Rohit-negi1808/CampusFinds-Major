import React from 'react';

// Pure React modal — NO Bootstrap JS dependency
const SuccessModal = ({ show, onClose, isClaim = false, reportType, claimData = {} }) => {
  if (!show) return null;

  let title, main, sub;
  if (isClaim) {
    title = '🎉 Claim Submitted!';
    main  = 'Your claim has been submitted successfully!';
    sub   = claimData.contact
      ? `The admin will review your claim and contact you at ${claimData.contact}.`
      : 'The admin will review your claim and contact you soon.';
  } else {
    title = reportType === 'lost' ? '✅ Lost Report Submitted!' : '✅ Found Report Submitted!';
    main  = reportType === 'lost'
      ? 'Your lost item report has been submitted!'
      : 'Your found item report has been submitted!';
    sub   = reportType === 'lost'
      ? "We'll notify you if someone finds your item."
      : "We'll notify you if someone claims the item.";
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, padding: '2.5rem 2rem',
          maxWidth: 420, width: '100%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)', animation: 'popIn .3s ease'
        }}
      >
        <style>{`@keyframes popIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>
          {isClaim ? '🙋' : '📦'}
        </div>
        <h4 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.6rem', fontSize: '1.3rem' }}>{title}</h4>
        <p style={{ fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>{main}</p>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.8rem' }}>{sub}</p>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '0.75rem 2.5rem', fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer', width: '100%'
          }}
        >
          Got it! 👍
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
