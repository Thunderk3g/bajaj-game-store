// Screens.jsx — Home + Results screens for the bubble shooter.
import React from 'react';

function BajajLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        position: 'relative', width: 36, height: 36,
        background: '#0B3FA8', borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
      }}>
        <span style={{
          color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: '-0.04em',
        }}>B</span>
        <div style={{
          position: 'absolute', top: 5, right: 5, width: 6, height: 6,
          borderRadius: '50%', background: '#E63946',
        }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 900, fontSize: 14, letterSpacing: '0.04em',
        }}>LIFE</span>
        <span style={{
          color: 'rgba(255,255,255,0.55)', fontSize: 8,
          fontWeight: 700, letterSpacing: '0.14em', marginTop: 2,
        }}>LIFE GOALS DONE</span>
      </div>
    </div>
  );
}

function MiniGamePreview() {
  const colors = [
    { c: '#3B82F6', d: '#1E40AF', g: '#93C5FD' },
    { c: '#EF4444', d: '#991B1B', g: '#FCA5A5' },
    { c: '#FACC15', d: '#A16207', g: '#FEF08A' },
    { c: '#10B981', d: '#065F46', g: '#6EE7B7' },
    { c: '#EC4899', d: '#9D174D', g: '#F9A8D4' },
    { c: '#8B5CF6', d: '#5B21B6', g: '#C4B5FD' },
  ];
  const R = 18;
  const D = R * 2;
  const RH = D * 0.866;
  const cluster = [];
  const pattern = [
    [0, 1, 2, 3, 4],
    [5, 0, 1, 2],
    [3, 3, 3, 4, 5],
    [0, 2, 5, 1],
  ];
  for (let r = 0; r < pattern.length; r++) {
    const row = pattern[r];
    const offset = r % 2 === 1 ? R : 0;
    for (let c = 0; c < row.length; c++) {
      const x = R + 4 + c * D + offset;
      const y = R + 4 + r * RH;
      cluster.push({ x, y, color: colors[row[c]] });
    }
  }
  const dotPath = [
    { x: 110, y: 220 }, { x: 116, y: 200 }, { x: 122, y: 180 },
    { x: 128, y: 160 }, { x: 132, y: 140 }, { x: 136, y: 120 },
  ];
  const cannonX = 100, cannonY = 240;
  const ammoColor = colors[1];

  return (
    <div style={{
      position: 'relative', width: 220, height: 280, margin: '0 auto',
      borderRadius: 18, overflow: 'hidden',
      background: 'linear-gradient(180deg, #0F1B4D 0%, #1B2A6E 60%, #2C3F8F 100%)',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 12px 40px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(255,200,69,0.25)',
    }}>
      <div className="starfield" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />

      {cluster.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y,
          width: D, height: D, borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 32% 28%, ${b.color.g} 0%, ${b.color.c} 45%, ${b.color.d} 100%)`,
          boxShadow: 'inset 0 -6px 8px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4)',
        }} />
      ))}

      {dotPath.map((d, i) => (
        <div key={i} className="aim-dot"
          style={{ left: d.x, top: d.y, width: 4, height: 4, opacity: 1 - i * 0.13 }} />
      ))}

      <div className="shooter-glow" style={{
        position: 'absolute', left: cannonX, top: cannonY,
        transform: 'translate(-50%, -50%)',
        width: 44, height: 44, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 28%, #FFE38A 0%, #FFC845 40%, #E8A60D 100%)',
        boxShadow: '0 0 0 3px rgba(255,200,69,0.2), 0 4px 10px rgba(0,0,0,0.45)',
      }} />

      <div style={{
        position: 'absolute', left: cannonX, top: cannonY,
        transform: 'translate(-50%, -50%)',
        width: D, height: D, borderRadius: '50%',
        background: `radial-gradient(circle at 32% 28%, ${ammoColor.g} 0%, ${ammoColor.c} 45%, ${ammoColor.d} 100%)`,
        boxShadow: 'inset 0 -6px 8px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4)',
      }} />

      <div style={{
        position: 'absolute', left: '50%', bottom: 10,
        transform: 'translateX(-50%)',
        background: 'rgba(255,200,69,0.95)',
        color: '#061343', fontWeight: 900, fontSize: 9,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '4px 10px', borderRadius: 999,
        boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
        whiteSpace: 'nowrap',
      }}>Tap to play</div>
    </div>
  );
}

export function HomeScreen({ onStart, theme, levelLabel }) {
  return (
    <div className="screen-enter" style={{
      position: 'absolute', inset: 0,
      background: theme.homeBg,
      display: 'flex', flexDirection: 'column',
      padding: '32px 20px 26px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 2,
      }}>
        <BajajLogo />
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,0.55)',
          fontWeight: 800, letterSpacing: '0.16em',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '3px 8px', borderRadius: 999,
        }}>BETA</div>
      </div>

      <div style={{ marginTop: 24, position: 'relative', zIndex: 2 }}>
        <MiniGamePreview />
      </div>

      <div style={{ marginTop: 22, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1 className="font-display" style={{
          color: 'white', fontSize: 30, lineHeight: 1.05,
          marginBottom: 8, textShadow: '0 3px 0 rgba(0,0,0,0.25)',
        }}>
          Pop the bubbles.<br />
          <span style={{ color: 'var(--brand-gold)' }}>Save your life goals.</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 13,
          fontWeight: 500, lineHeight: 1.4,
          maxWidth: 280, margin: '0 auto',
        }}>
          Match 3 of the same colour. Each colour is a real-life risk Bajaj Life helps you cover.
        </p>
      </div>

      <button
        onClick={onStart}
        className="game-btn chunk-shadow-lg"
        style={{
          marginTop: 'auto',
          background: 'linear-gradient(180deg, #FFE38A 0%, #FFC845 50%, #E8A60D 100%)',
          color: 'var(--brand-navy-deep)',
          padding: '15px 18px', borderRadius: 16,
          fontSize: 16, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, whiteSpace: 'nowrap',
          position: 'relative', zIndex: 2,
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>▶  Start Game</span>
        <span style={{
          background: 'var(--brand-navy-deep)', color: 'var(--brand-gold)',
          padding: '4px 9px', borderRadius: 999,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>{levelLabel || 'LVL 1'}</span>
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1.5px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '10px 8px',
      textAlign: 'center', color: 'white',
    }}>
      <div style={{
        fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.1em', marginBottom: 4,
      }}>{label.toUpperCase()}</div>
      <div className="font-display" style={{
        fontSize: 22, fontWeight: 900, color: 'var(--brand-gold)', lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function Confetti() {
  const colors = ['#FFC845', '#FFE38A', '#3B82F6', '#EF4444', '#10B981', '#EC4899', '#8B5CF6'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {Array.from({ length: 30 }).map((_, i) => {
        const left = Math.random() * 100;
        const dur = 2 + Math.random() * 2;
        const delay = Math.random() * 1.5;
        const color = colors[i % colors.length];
        return (
          <div key={i} className="confetti" style={{
            left: `${left}%`, background: color,
            '--dur': `${dur}s`, '--delay': `${delay}s`,
            top: -20, transform: `rotate(${Math.random() * 360}deg)`,
          }} />
        );
      })}
    </div>
  );
}

export function ResultsScreen({ stats, won, onRetry, onHome, onBookSlot, retryLabel }) {
  const score = stats.score || 0;
  const fsScore = Math.min(100, Math.round(score / 30));
  const grade = fsScore >= 85 ? 'A+' : fsScore >= 70 ? 'A' : fsScore >= 55 ? 'B' : fsScore >= 40 ? 'C' : 'D';

  return (
    <div className="screen-enter" style={{
      position: 'absolute', inset: 0,
      background: won
        ? 'linear-gradient(180deg, #1B2A6E 0%, #0B1E5B 100%)'
        : 'linear-gradient(180deg, #4B1E2E 0%, #1F0E1A 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '40px 20px 28px',
      overflow: 'hidden',
    }}>
      {won && <Confetti />}
      <div style={{ textAlign: 'center', color: 'white', position: 'relative', zIndex: 2 }}>
        <div className="ribbon" style={{
          background: won ? 'var(--brand-gold)' : '#EF4444',
          color: won ? 'var(--brand-navy-deep)' : 'white',
        }}>
          {won ? 'Level Complete' : 'Game Over'}
        </div>
        <h1 className="font-display" style={{
          fontSize: 36, lineHeight: 1, margin: '14px 0 6px',
          color: won ? 'var(--brand-gold)' : 'white',
          textShadow: '0 4px 0 rgba(0,0,0,0.3)',
        }}>
          {won ? 'Goals secured!' : 'Try again'}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          {won ? 'You cleared every bubble.' : 'The bubbles got too close.'}
        </p>
      </div>

      <div style={{ margin: '24px auto', position: 'relative', width: 180, height: 180 }}>
        <svg viewBox="0 0 180 180" width="180" height="180" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle cx="90" cy="90" r="78" fill="none" stroke="url(#fsGrad)" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(fsScore / 100) * 490} 490`}
            transform="rotate(-90 90 90)" />
          <defs>
            <linearGradient id="fsGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFE38A" />
              <stop offset="100%" stopColor="#E8A60D" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>SECURITY SCORE</div>
          <div className="font-display" style={{ fontSize: 56, fontWeight: 900, color: 'var(--brand-gold)', lineHeight: 1 }}>{fsScore}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginTop: 2 }}>Grade {grade}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 4px' }}>
        <Stat label="Score" value={score.toLocaleString()} />
        <Stat label="Shots Used" value={stats.shotsUsed || 0} />
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.07)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: 14, padding: '12px 14px',
        marginTop: 14, color: 'white',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '0.1em', marginBottom: 4 }}>UNLOCKED INSIGHT</div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>
          {won
            ? 'Just like clearing bubbles, the right cover stops risks before they pile up.'
            : 'When risks pile up, they catch you off guard. Cover early.'}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {onBookSlot && (
          <button onClick={onBookSlot} className="game-btn chunk-shadow" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: 'white', padding: '12px 20px', borderRadius: 14,
            fontSize: 13, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            📅 Book a Slot with an Advisor
          </button>
        )}
        <button onClick={onRetry} className="game-btn chunk-shadow-lg" style={{
          background: 'linear-gradient(180deg, #FFE38A 0%, #FFC845 50%, #E8A60D 100%)',
          color: 'var(--brand-navy-deep)',
          padding: '16px 20px', borderRadius: 16,
          fontSize: 16, fontWeight: 900,
        }}>
          {retryLabel || (won ? 'Play next level →' : 'Try again')}
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
