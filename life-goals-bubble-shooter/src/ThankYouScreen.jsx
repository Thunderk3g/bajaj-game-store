// ThankYouScreen.jsx — confirmation after a slot is booked.
import React from 'react';

export default function ThankYouScreen({ details, onPlayAgain, onHome }) {
  return (
    <div className="screen-enter" style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #1B2A6E 0%, #0B1E5B 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '60px 24px 28px',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', color: 'white',
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: 'linear-gradient(180deg, #FFE38A 0%, #FFC845 60%, #E8A60D 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 0 6px rgba(255,200,69,0.18), 0 12px 30px rgba(0,0,0,0.35)',
        marginBottom: 22,
      }}>
        <span style={{ fontSize: 40, color: '#061343', fontWeight: 900 }}>✓</span>
      </div>

      <div className="ribbon" style={{ marginBottom: 14 }}>You're All Set</div>
      <h1 className="font-display" style={{
        fontSize: 32, lineHeight: 1.05, color: 'var(--brand-gold)',
        textShadow: '0 4px 0 rgba(0,0,0,0.3)', marginBottom: 8,
      }}>
        Slot booked!
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500, maxWidth: 280 }}>
        A Bajaj Life advisor will reach out to you on{' '}
        <strong style={{ color: 'white' }}>{details?.date || '—'}</strong> at{' '}
        <strong style={{ color: 'white' }}>{details?.time || '—'}</strong>.
      </p>

      <div style={{
        marginTop: 'auto', display: 'flex', flexDirection: 'column',
        gap: 8, width: '100%', maxWidth: 320,
      }}>
        <button onClick={onPlayAgain} className="game-btn chunk-shadow-lg" style={{
          background: 'linear-gradient(180deg, #FFE38A 0%, #FFC845 50%, #E8A60D 100%)',
          color: 'var(--brand-navy-deep)',
          padding: '16px 20px', borderRadius: 16,
          fontSize: 16, fontWeight: 900,
        }}>
          Play again
        </button>
        <button onClick={onHome} style={{
          background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.7)', padding: '8px',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>← Home</button>
      </div>
    </div>
  );
}
