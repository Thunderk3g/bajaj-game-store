// Screens.jsx — Home + Results screens for the bubble shooter.
// Restyled to match the stackibility-stack design language.
import React from 'react';
import { COLORS } from './data.js';

/* ─── Inline icons ─────────────────────────────────────── */
function PlayIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function HelpIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </svg>
  );
}

function TrophyIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 5h14v5a7 7 0 0 1-14 0V5z" fill="#fff" />
      <path d="M5 7h4v3a3 3 0 0 1-3-3z" fill="#fff" opacity="0.85" />
      <path d="M27 7h-4v3a3 3 0 0 0 3-3z" fill="#fff" opacity="0.85" />
      <rect x="13" y="16" width="6" height="6" fill="#fff" opacity="0.92" />
      <rect x="9" y="22" width="14" height="4" rx="1.5" fill="#fff" />
    </svg>
  );
}

function HeartBreakIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 27s-10-6-10-14a6 6 0 0 1 10-4.5L14 12l4 3-3 4 1 8z" fill="#fff" />
      <path d="M16 27s10-6 10-14a6 6 0 0 0-10-4.5L18 12l-4 3 3 4-1 8z" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function ShieldIcon({ size = 26, stroke = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" fill="rgba(255,255,255,0.18)" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}

/* ─── Decorative bubble illustration for the home screen ────────── */
const BUBBLE_PALETTE = [
  { c: '#3B82F6', d: '#1E40AF', g: '#93C5FD' }, // blue
  { c: '#EF4444', d: '#991B1B', g: '#FCA5A5' }, // red
  { c: '#FACC15', d: '#A16207', g: '#FEF08A' }, // yellow
  { c: '#10B981', d: '#065F46', g: '#6EE7B7' }, // green
  { c: '#EC4899', d: '#9D174D', g: '#F9A8D4' }, // pink
  { c: '#8B5CF6', d: '#5B21B6', g: '#C4B5FD' }, // purple
];

function bubbleBg(p) {
  return `radial-gradient(circle at 32% 28%, ${p.g} 0%, ${p.c} 45%, ${p.d} 100%)`;
}

function HexBubbleField() {
  // Mini bubble-shooter preview: cluster up top, cannon zone at bottom.
  const R = 14;
  const D = R * 2;
  const RH = D * 0.866;

  // 3 hex rows, offset every other row, with a couple of gaps for variety.
  // null = gap. Palette indices otherwise.
  const pattern = [
    [0, 1, 2, 3, 4, 5],
    [2, 3, null, 4, 0],
    [5, 0, 1, null, 2, 3],
  ];

  const cluster = [];
  // Centre the cluster horizontally inside the 240-wide container.
  // Row 0 has 6 bubbles → row width ≈ 6*D = 168 → leftPad ≈ (240-168)/2 ≈ 36.
  const leftPad = 36;
  const topPad = 24;
  for (let r = 0; r < pattern.length; r++) {
    const row = pattern[r];
    const offset = r % 2 === 1 ? R : 0;
    for (let c = 0; c < row.length; c++) {
      const palIdx = row[c];
      if (palIdx === null) continue;
      const x = leftPad + R + c * D + offset;
      const y = topPad + r * RH;
      cluster.push({ x, y, p: BUBBLE_PALETTE[palIdx] });
    }
  }

  const containerW = 240;
  const cannonX = containerW / 2; // 120
  const cannonY = 200;
  const ammo = BUBBLE_PALETTE[1]; // red, contrasts with palette mix above

  // Aim trail: 5 dots from just above the cannon up toward the cluster.
  const trail = [
    { y: 150, op: 0.85 },
    { y: 138, op: 0.70 },
    { y: 126, op: 0.55 },
    { y: 114, op: 0.40 },
    { y: 102, op: 0.25 },
  ];

  // Two queue balls left of (and below) the cannon area.
  const queue = [
    { x: 70, y: 240, p: BUBBLE_PALETTE[2] },
    { x: 98, y: 240, p: BUBBLE_PALETTE[3] },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: containerW,
        height: 280,
        margin: '0 auto',
        borderRadius: 22,
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(14,79,148,0.55), rgba(5,26,58,0.85) 70%), #051a3a',
        animation: 'ls-float 4s ease-in-out infinite',
        filter: 'drop-shadow(0 22px 26px rgba(0, 0, 0, 0.4))',
      }}
    >
      {/* Faint starfield to read as the in-game playfield */}
      <div
        className="starfield"
        style={{ position: 'absolute', inset: 0, opacity: 0.55 }}
      />

      {/* Hex cluster — top third */}
      {cluster.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y,
          width: D, height: D, borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: bubbleBg(b.p),
          boxShadow: 'inset 0 -5px 7px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4)',
        }} />
      ))}

      {/* Aim trail — small white dots between cluster and cannon */}
      {trail.map((t, i) => (
        <div key={`t${i}`} style={{
          position: 'absolute',
          left: cannonX, top: t.y,
          width: 4, height: 4,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: `rgba(255,255,255,${t.op})`,
          boxShadow: '0 0 6px rgba(255,255,255,0.4)',
        }} />
      ))}

      {/* Cannon glow halo */}
      <div className="shooter-glow" style={{
        position: 'absolute', left: cannonX, top: cannonY,
        transform: 'translate(-50%, -50%)',
        width: 60, height: 60, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,133,51,0.55) 0%, rgba(242,105,34,0.30) 45%, transparent 75%)',
      }} />

      {/* Loaded ammo bubble — centred on the halo */}
      <div style={{
        position: 'absolute', left: cannonX, top: cannonY,
        transform: 'translate(-50%, -50%)',
        width: D + 4, height: D + 4, borderRadius: '50%',
        background: bubbleBg(ammo),
        boxShadow: 'inset 0 -6px 8px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4), 0 0 14px rgba(239,68,68,0.55)',
      }} />

      {/* "Up Next" label above queue */}
      <div style={{
        position: 'absolute',
        left: 84, top: 224,
        transform: 'translate(-50%, -50%)',
        fontFamily: "'Poppins', system-ui, sans-serif",
        fontSize: 7,
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        Up Next
      </div>

      {/* Queue balls */}
      {queue.map((b, i) => (
        <div key={`q${i}`} style={{
          position: 'absolute', left: b.x, top: b.y,
          width: 24, height: 24, borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: bubbleBg(b.p),
          boxShadow: 'inset 0 -4px 6px rgba(0,0,0,0.3), inset 0 1.5px 2px rgba(255,255,255,0.4)',
          opacity: 0.9,
        }} />
      ))}
    </div>
  );
}

/* ─── HomeScreen ──────────────────────────────────────── */
export function HomeScreen({ onStart, theme, levelLabel }) {
  // theme is accepted for API compat but ignored — body bg handles colour now.
  void theme;

  return (
    <div
      className="screen-enter"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '64px 24px 36px',
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(14, 79, 148, 0.55), rgba(5, 26, 58, 0.85) 70%), #051a3a',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
      }}
    >
      {/* Logo + title */}
      <div style={{ textAlign: 'center', animation: 'ls-rise 600ms ease-out both' }}>
        <div className="logo-stack" aria-hidden="true">
          <div className="logo-block logo-block-1" />
          <div className="logo-block logo-block-2" />
          <div className="logo-block logo-block-3" />
        </div>
        <div className="logo-title">Pop<span>Goals</span></div>
        <div className="logo-tagline">Match · Pop · Protect</div>
      </div>

      {/* Hero — bubble field */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        pointerEvents: 'none',
      }}>
        <HexBubbleField />
        <div style={{
          marginTop: 14,
          textAlign: 'center',
          fontFamily: "'Poppins', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          color: '#fff',
          maxWidth: 300,
        }}>
          Pop the bubbles.{' '}
          <span style={{
            background: 'linear-gradient(90deg, #FF8533 0%, #FFD37A 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}>
            Save your life goals.
          </span>
        </div>
      </div>

      {/* CTA stack */}
      <div className="start-cta-stack">
        <button
          type="button"
          className="ls-btn ls-btn-primary blink"
          onClick={onStart}
          style={{ width: '100%', maxWidth: 340, height: 64, fontSize: 19, position: 'relative' }}
        >
          <PlayIcon />
          Play
          <span style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.32)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.12em',
            padding: '4px 9px',
            borderRadius: 999,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22)',
          }}>
            {levelLabel || 'LVL 1'}
          </span>
        </button>

        <div className="start-secondary-row">
          <button
            type="button"
            className="ls-btn ls-btn-secondary"
            style={{ flex: 1, height: 52, fontSize: 13 }}
            onClick={() => alert(
              'How to play:\n\n• Drag inside the board to aim, release to fire.\n• Match 3+ bubbles of the same colour to pop them.\n• Clear every bubble before you run out of shots.'
            )}
          >
            <HelpIcon />
            How to Play
          </button>
        </div>

        <div className="bajaj-mark">
          <span className="bajaj-mark-icon" aria-hidden="true" />
          Powered by Bajaj Life
        </div>
      </div>
    </div>
  );
}

/* ─── Confetti (kept lightweight) ─────────────────────── */
function Confetti() {
  const colors = ['#FFC845', '#FFE38A', '#FF8533', '#3B8DD4', '#005BAC', '#10B981', '#EC4899'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {Array.from({ length: 26 }).map((_, i) => {
        const left = Math.random() * 100;
        const dur = 2 + Math.random() * 2;
        const delay = Math.random() * 1.5;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${left}%`,
              background: color,
              '--dur': `${dur}s`,
              '--delay': `${delay}s`,
              top: -20,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── ResultsScreen — full-screen game-over view ──────── */
const PRODUCT_LINEUP = ['red', 'blue', 'yellow', 'pink'];

export function ResultsScreen({ stats, won, onRetry, onHome, onBookSlot, retryLabel }) {
  const score = stats?.score || 0;
  const shotsUsed = stats?.shotsUsed || 0;
  const fsScore = Math.min(100, Math.round(score / 30));

  // Build a flavor + insurance copy that references colour→product mapping.
  const productNames = PRODUCT_LINEUP.map((id) => COLORS[id]?.product).filter(Boolean);
  const productList = productNames.slice(0, 3).join(', ');

  return (
    <div
      className="screen-enter"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 22px 28px',
        gap: 16,
        overflowY: 'auto',
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(14, 79, 148, 0.55), rgba(5, 26, 58, 0.85) 70%), #051a3a',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {won && <Confetti />}

      {/* Headline glass card */}
      <div className="go-card">
        <div
          className="go-trophy"
          aria-hidden="true"
          style={!won ? {
            background: 'linear-gradient(180deg, #F87171, #B91C1C)',
          } : undefined}
        >
          {won ? <TrophyIcon /> : <HeartBreakIcon />}
        </div>

        <div className="go-eyebrow">{won ? 'Goals Secured' : 'Game Over'}</div>
        <div className="go-height-row">
          <span className="ls-num" style={{ fontSize: 84, lineHeight: 1, color: '#fff' }}>
            {score.toLocaleString()}
          </span>
          <span className="go-unit">POINTS</span>
        </div>
        <div className="go-flavor">
          {won
            ? 'Every bubble cleared — every life goal protected.'
            : 'The bubbles piled up faster than you could pop them.'}
        </div>

        <div className="go-stats-grid">
          <div className="go-stat">
            <div className="hud-label">Shots Used</div>
            <span className="ls-num">{shotsUsed}</span>
          </div>
          <div className="go-stat go-stat-accent">
            <div className="hud-label">Security Score</div>
            <span className="ls-num">{fsScore}</span>
          </div>
        </div>
      </div>

      {/* Insurance pitch */}
      <div className="go-insurance">
        <div className="go-insurance-icon" aria-hidden="true">
          <ShieldIcon size={26} />
        </div>
        <div className="go-insurance-title">
          Bubbles burst. <span>Your life goals shouldn't.</span>
        </div>
        <div className="go-insurance-body">
          Each colour you popped stood for a real-life risk — health, income, education, retirement.
          Bajaj Life products like {productList} keep those goals safe even when life takes an
          unexpected turn.
        </div>
        {onBookSlot && (
          <button
            type="button"
            className="ls-btn ls-btn-primary go-insurance-cta"
            onClick={onBookSlot}
          >
            <CalendarIcon />
            Book a Slot with an Advisor
          </button>
        )}
        <div className="go-insurance-foot">Free callback · No obligation · 2 minutes</div>
      </div>

      {/* Bottom CTAs */}
      <div className="go-cta-stack">
        <button
          type="button"
          className="ls-btn ls-btn-secondary"
          onClick={onRetry}
          style={{ height: 52, fontSize: 14 }}
        >
          {retryLabel || 'Play Again'} →
        </button>
        <button type="button" className="ls-text-btn" onClick={onHome}>
          ← Back home
        </button>
      </div>
    </div>
  );
}
