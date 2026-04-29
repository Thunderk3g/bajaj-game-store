// ThankYouScreen.jsx — confirmation after a slot is booked.
// Restyled to match the stackibility-stack design language.
import React from 'react';

function CheckIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export default function ThankYouScreen({ details, onPlayAgain, onHome }) {
  const date = details?.date || '—';
  const time = details?.time || '—';

  return (
    <div
      className="screen-enter"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 22px 36px',
        gap: 16,
        overflowY: 'auto',
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(14, 79, 148, 0.55), rgba(5, 26, 58, 0.85) 70%), #051a3a',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="ls-card ls-card-thanks">
        <div className="ls-check" aria-hidden="true">
          <CheckIcon />
        </div>
        <div className="ls-card-title">You're all set!</div>
        <div className="ls-card-sub">
          A Bajaj Life advisor will reach out to you on{' '}
          <strong style={{ color: '#fff' }}>{date}</strong> at{' '}
          <strong style={{ color: '#fff' }}>{time}</strong>.
        </div>

        {/* What happens next */}
        <div
          style={{
            marginTop: 18,
            padding: '14px 14px 12px',
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.06)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
            textAlign: 'left',
          }}
        >
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#FFD37A',
            marginBottom: 8,
          }}>
            What happens next
          </div>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.86)',
          }}>
            <li style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: '#FF8533', fontWeight: 900 }}>1.</span>
              You'll receive a confirmation SMS shortly.
            </li>
            <li style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: '#FF8533', fontWeight: 900 }}>2.</span>
              An advisor will call at your booked time.
            </li>
            <li style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: '#FF8533', fontWeight: 900 }}>3.</span>
              No pressure — just a quick chat about cover.
            </li>
          </ul>
        </div>

        <button
          type="button"
          className="ls-btn ls-btn-primary ls-form-cta"
          onClick={onPlayAgain}
          style={{ marginTop: 18 }}
        >
          Play again
        </button>
        <button type="button" className="ls-text-btn" onClick={onHome}>
          ← Back home
        </button>
      </div>
    </div>
  );
}
