// BubbleShooter.jsx — classic bubble shooter
// Match 3+ same colour to clear. Hex grid, ceiling drops every N shots.
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COLORS } from './data.js';

const BUBBLE_R = 22;
const BUBBLE_D = BUBBLE_R * 2;
const ROW_H = BUBBLE_D * 0.866;
const COLS = 8;
export const GAME_W = COLS * BUBBLE_D + BUBBLE_R; // 374
export const GAME_H = 560;
const SHOOTER_Y = GAME_H - 56;
const SHOT_SPEED = 16;
const DROP_INTERVAL = 6;          // ceiling drops every 6 shots
const DROP_DIST = ROW_H;
const LOSE_LINE = SHOOTER_Y - 80;

function gridToPx(row, col, ceilingDrop) {
  const x = BUBBLE_R + col * BUBBLE_D + (row % 2 === 1 ? BUBBLE_R : 0);
  const y = BUBBLE_R + 8 + row * ROW_H + ceilingDrop;
  return { x, y };
}

function buildInitialBubbles(level) {
  const out = [];
  const colors = level.colors;
  const rows = level.rows;
  for (let row = 0; row < rows; row++) {
    const cols = row % 2 === 1 ? COLS - 1 : COLS;
    for (let col = 0; col < cols; col++) {
      // Random gaps in the lower rows for variety.
      if (row >= rows - 2 && Math.random() < 0.35) continue;
      const colorId = colors[Math.floor(Math.random() * colors.length)];
      const { x, y } = gridToPx(row, col, 0);
      out.push({ id: `b${row}-${col}`, colorId, row, col, x, y, state: 'alive' });
    }
  }
  return out;
}

function snapToGrid(px, py, ceilingDrop) {
  let bestRow = 0, bestCol = 0, bestD = Infinity;
  for (let row = 0; row < 14; row++) {
    const cols = row % 2 === 1 ? COLS - 1 : COLS;
    for (let col = 0; col < cols; col++) {
      const { x, y } = gridToPx(row, col, ceilingDrop);
      const d = Math.hypot(x - px, y - py);
      if (d < bestD) { bestD = d; bestRow = row; bestCol = col; }
    }
  }
  return { row: bestRow, col: bestCol, ...gridToPx(bestRow, bestCol, ceilingDrop) };
}

function Bubble({ x, y, colorDef, popping, falling, scale = 1 }) {
  const bg = `radial-gradient(circle at 32% 28%, ${colorDef.glow} 0%, ${colorDef.color} 45%, ${colorDef.colorDeep} 100%)`;
  return (
    <div
      className={`bubble ${popping ? 'bubble-popping' : ''} ${falling ? 'bubble-falling' : ''}`}
      style={{ left: x, top: y, width: BUBBLE_D * scale, height: BUBBLE_D * scale, background: bg }}
    />
  );
}

export default function BubbleShooter({ level, onWin, onLose }) {
  const [bubbles, setBubbles] = useState(() => buildInitialBubbles(level));
  const [shotsLeft, setShotsLeft] = useState(level.shots);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ceilingDrop, setCeilingDrop] = useState(0);
  const [shotsTaken, setShotsTaken] = useState(0);

  const availableColors = useMemo(() => {
    const set = new Set(bubbles.filter(b => b.state === 'alive').map(b => b.colorId));
    const arr = [...set];
    return arr.length ? arr : level.colors;
  }, [bubbles, level.colors]);

  const [currentColor, setCurrentColor] = useState(() => level.colors[0]);
  const [nextColor, setNextColor] = useState(() => level.colors[1] || level.colors[0]);

  const [projectile, setProjectile] = useState(null);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [aiming, setAiming] = useState(false);
  const [scorePops, setScorePops] = useState([]);
  const [bursts, setBursts] = useState([]);

  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const finishedRef = useRef(false);

  const cycleAmmo = useCallback(() => {
    const pool = availableColors;
    setCurrentColor(() => {
      const newCur = nextColor;
      setNextColor(pool[Math.floor(Math.random() * pool.length)]);
      return newCur;
    });
  }, [availableColors, nextColor]);

  // Keep ammo within still-available colours after the board changes.
  useEffect(() => {
    if (!availableColors.includes(currentColor)) {
      setCurrentColor(availableColors[0]);
    }
    if (!availableColors.includes(nextColor)) {
      setNextColor(availableColors[Math.floor(Math.random() * availableColors.length)]);
    }
  }, [availableColors, currentColor, nextColor]);

  const onPointerMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = rect.width / GAME_W;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const dx = x - GAME_W / 2;
    const dy = y - SHOOTER_Y;
    let a = Math.atan2(dy, dx);
    const min = -Math.PI + 0.18;
    const max = -0.18;
    if (a > max) a = max;
    if (a < min) a = min;
    setAimAngle(a);
    setAiming(true);
  }, []);

  const onPointerUp = useCallback(() => {
    if (projectile || finishedRef.current) { setAiming(false); return; }
    if (shotsLeft <= 0) { setAiming(false); return; }
    setProjectile({
      x: GAME_W / 2,
      y: SHOOTER_Y,
      vx: Math.cos(aimAngle) * SHOT_SPEED,
      vy: Math.sin(aimAngle) * SHOT_SPEED,
      colorId: currentColor,
    });
    setAiming(false);
  }, [aimAngle, currentColor, projectile, shotsLeft]);

  // Projectile loop
  useEffect(() => {
    if (!projectile) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      setProjectile((p) => {
        if (!p) return p;
        let { x, y, vx, vy, colorId } = p;
        x += vx; y += vy;
        if (x < BUBBLE_R) { x = BUBBLE_R; vx = -vx; }
        if (x > GAME_W - BUBBLE_R) { x = GAME_W - BUBBLE_R; vx = -vx; }
        if (y < BUBBLE_R + ceilingDrop) {
          handleStick(x, BUBBLE_R + ceilingDrop, colorId);
          return null;
        }
        const alive = bubbles.filter(b => b.state === 'alive');
        for (const b of alive) {
          if (Math.hypot(b.x - x, b.y - y) < BUBBLE_D - 4) {
            const ang = Math.atan2(y - b.y, x - b.x);
            const sx = b.x + Math.cos(ang) * (BUBBLE_D * 0.95);
            const sy = b.y + Math.sin(ang) * (BUBBLE_D * 0.95);
            handleStick(sx, sy, colorId);
            return null;
          }
        }
        return { x, y, vx, vy, colorId };
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [projectile, bubbles, ceilingDrop]);

  const handleStick = useCallback((x, y, colorId) => {
    const snap = snapToGrid(x, y, ceilingDrop);
    const newBubble = {
      id: `stuck-${Date.now()}-${Math.random()}`,
      colorId,
      row: snap.row, col: snap.col,
      x: snap.x, y: snap.y,
      state: 'alive',
    };

    setBubbles((prev) => {
      const occupied = prev.some(b => b.state === 'alive' && Math.hypot(b.x - snap.x, b.y - snap.y) < 4);
      const next = occupied ? prev : [...prev, newBubble];

      if (!occupied) {
        const chain = collectChain(next, newBubble.id, colorId);
        if (chain.length >= 3) {
          const after = next.map(b => chain.includes(b.id) ? { ...b, state: 'popping' } : b);
          // Schedule removal + floating-bubble drop after the pop animation.
          setTimeout(() => {
            setBubbles((curr) => {
              const remaining = curr.filter(b => !chain.includes(b.id));
              const floating = findFloating(remaining);
              if (floating.length) {
                pushScorePop(snap.x, snap.y - 30, `+${floating.length * 50} drop!`);
                setScore(s => s + floating.length * 50);
                return remaining.map(b => floating.includes(b.id) ? { ...b, state: 'falling' } : b);
              }
              return remaining;
            });
            setTimeout(() => {
              setBubbles(curr => curr.filter(b => b.state !== 'falling'));
            }, 900);
          }, 320);

          const points = chain.length * 100 + (combo > 0 ? combo * 50 : 0);
          setScore(s => s + points);
          setCombo(c => c + 1);
          pushScorePop(snap.x, snap.y - 20, `+${points}`);
          pushBurst(snap.x, snap.y, COLORS[colorId].color);
          return after;
        }
        setCombo(0);
      }
      return next;
    });

    setShotsLeft(s => s - 1);
    setShotsTaken((t) => {
      const newT = t + 1;
      if (newT % DROP_INTERVAL === 0) {
        setCeilingDrop(d => d + DROP_DIST);
      }
      return newT;
    });
    cycleAmmo();
  }, [ceilingDrop, combo, cycleAmmo]);

  function collectChain(all, startId, colorId) {
    const map = new Map(all.filter(b => b.state === 'alive').map(b => [b.id, b]));
    const start = map.get(startId);
    if (!start) return [startId];
    const seen = new Set([startId]);
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      for (const b of map.values()) {
        if (seen.has(b.id)) continue;
        if (b.colorId !== colorId) continue;
        const d = Math.hypot(b.x - cur.x, b.y - cur.y);
        if (d < BUBBLE_D * 1.25) {
          seen.add(b.id);
          queue.push(b);
        }
      }
    }
    return [...seen];
  }

  function findFloating(all) {
    const alive = all.filter(b => b.state === 'alive');
    const connected = new Set();
    const seeds = alive.filter(b => b.y < BUBBLE_R + 8 + ceilingDrop + ROW_H * 0.5);
    const queue = [...seeds];
    seeds.forEach(s => connected.add(s.id));
    while (queue.length) {
      const cur = queue.shift();
      for (const b of alive) {
        if (connected.has(b.id)) continue;
        const d = Math.hypot(b.x - cur.x, b.y - cur.y);
        if (d < BUBBLE_D * 1.25) {
          connected.add(b.id);
          queue.push(b);
        }
      }
    }
    return alive.filter(b => !connected.has(b.id)).map(b => b.id);
  }

  function pushBurst(x, y, color) {
    const id = Date.now() + Math.random();
    const parts = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return { id: `${id}-${i}`, x, y, color, bx: Math.cos(a) * 50, by: Math.sin(a) * 50 };
    });
    setBursts(prev => [...prev, ...parts]);
    setTimeout(() => {
      setBursts(prev => prev.filter(p => !p.id.toString().startsWith(`${id}-`)));
    }, 600);
  }

  function pushScorePop(x, y, text) {
    const id = Date.now() + Math.random();
    setScorePops(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => setScorePops(prev => prev.filter(p => p.id !== id)), 950);
  }

  // Win/lose detection.
  useEffect(() => {
    if (finishedRef.current) return;
    const aliveCount = bubbles.filter(b => b.state === 'alive').length;
    if (aliveCount === 0) {
      finishedRef.current = true;
      setTimeout(() => onWin && onWin({ score, shotsUsed: level.shots - shotsLeft, shotsLeft }), 400);
      return;
    }
    const crossed = bubbles.some(b => b.state === 'alive' && b.y > LOSE_LINE);
    if (crossed) {
      finishedRef.current = true;
      setTimeout(() => onLose && onLose({ score, shotsUsed: level.shots - shotsLeft, aliveCount }), 400);
      return;
    }
    if (shotsLeft <= 0 && !projectile) {
      finishedRef.current = true;
      setTimeout(() => onLose && onLose({ score, shotsUsed: level.shots, aliveCount }), 400);
    }
  }, [bubbles, shotsLeft, projectile, score, onWin, onLose, level.shots]);

  const trailDots = useMemo(() => {
    if (!aiming) return [];
    const dots = [];
    let x = GAME_W / 2;
    let y = SHOOTER_Y;
    let vx = Math.cos(aimAngle) * 8;
    let vy = Math.sin(aimAngle) * 8;
    for (let i = 0; i < 32; i++) {
      x += vx; y += vy;
      if (x < BUBBLE_R) { x = BUBBLE_R; vx = -vx; }
      if (x > GAME_W - BUBBLE_R) { x = GAME_W - BUBBLE_R; vx = -vx; }
      if (y < BUBBLE_R + ceilingDrop + 50) break;
      const hit = bubbles.some(b => b.state === 'alive' && Math.hypot(b.x - x, b.y - y) < BUBBLE_D - 6);
      if (hit) break;
      if (i % 2 === 0) dots.push({ x, y, i });
    }
    return dots;
  }, [aimAngle, aiming, bubbles, ceilingDrop]);

  const currentDef = COLORS[currentColor];
  const nextDef = COLORS[nextColor];

  return (
    <div
      ref={containerRef}
      className="no-touch"
      style={{
        position: 'relative',
        width: GAME_W,
        height: GAME_H,
        margin: '0 auto',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0F1B4D 0%, #1B2A6E 60%, #2C3F8F 100%)',
        boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4), 0 8px 30px rgba(0,0,0,0.4)',
      }}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={() => setAiming(false)}
      onTouchMove={(e) => { const t = e.touches[0]; onPointerMove({ clientX: t.clientX, clientY: t.clientY }); }}
      onTouchEnd={onPointerUp}
    >
      <div className="starfield" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />

      {/* Ceiling line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: ceilingDrop, height: 4,
        background: 'linear-gradient(180deg, rgba(255,200,69,0.6), transparent)',
      }} />

      {/* Lose line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: LOSE_LINE, height: 1,
        background: 'repeating-linear-gradient(90deg, rgba(239,68,68,0.6) 0 8px, transparent 8px 16px)',
      }} />

      {/* Bubbles */}
      {bubbles.map(b => (
        <Bubble key={b.id} x={b.x} y={b.y} colorDef={COLORS[b.colorId]}
          popping={b.state === 'popping'} falling={b.state === 'falling'} />
      ))}

      {/* Aim trail */}
      {trailDots.map(d => (
        <div key={d.i} className="aim-dot" style={{ left: d.x, top: d.y, opacity: 1 - d.i / 34 }} />
      ))}

      {/* Projectile */}
      {projectile && (
        <Bubble x={projectile.x} y={projectile.y} colorDef={COLORS[projectile.colorId]} />
      )}

      {/* Bursts */}
      {bursts.map(p => (
        <div key={p.id} className="burst-particle"
          style={{ left: p.x, top: p.y, background: p.color, '--bx': `${p.bx}px`, '--by': `${p.by}px` }} />
      ))}

      {/* Score pops */}
      {scorePops.map(p => (
        <div key={p.id} className="score-pop" style={{ left: p.x, top: p.y }}>{p.text}</div>
      ))}

      {/* Shooter */}
      <ShooterBase currentDef={currentDef} nextDef={nextDef} aimAngle={aimAngle}
        onSwap={() => { setCurrentColor(nextColor); setNextColor(currentColor); }} />

      {/* HUD */}
      <GameHUD level={level} score={score} shotsLeft={shotsLeft} combo={combo} currentDef={currentDef} />
    </div>
  );
}

function ShooterBase({ currentDef, nextDef, aimAngle, onSwap }) {
  const cannonLen = 34;
  const tipX = GAME_W / 2 + Math.cos(aimAngle) * cannonLen;
  const tipY = SHOOTER_Y + Math.sin(aimAngle) * cannonLen;
  return (
    <>
      <svg width={GAME_W} height={GAME_H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="cannonGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFE38A" />
            <stop offset="100%" stopColor="#E8A60D" />
          </linearGradient>
        </defs>
        <line x1={GAME_W / 2} y1={SHOOTER_Y} x2={tipX} y2={tipY}
          stroke="url(#cannonGrad)" strokeWidth="12" strokeLinecap="round" />
      </svg>

      <div className="shooter-glow" style={{
        position: 'absolute', left: GAME_W / 2, top: SHOOTER_Y,
        transform: 'translate(-50%, -50%)',
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 28%, #FFE38A 0%, #FFC845 40%, #E8A60D 100%)',
        boxShadow: '0 0 0 4px rgba(255,200,69,0.2), 0 8px 18px rgba(0,0,0,0.45)',
        zIndex: 9,
      }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none' }}>
        <Bubble x={GAME_W / 2} y={SHOOTER_Y} colorDef={currentDef} />
      </div>

      <button
        onClick={onSwap}
        title="Tap to swap"
        style={{
          position: 'absolute',
          left: GAME_W / 2 + 60, top: SHOOTER_Y,
          transform: 'translate(-50%, -50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 28%, ${nextDef.glow}, ${nextDef.color} 50%, ${nextDef.colorDeep})`,
          border: '2px solid rgba(255,255,255,0.4)',
          cursor: 'pointer', zIndex: 12, padding: 0,
          boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
        }}
      />
      <div style={{
        position: 'absolute',
        left: GAME_W / 2 + 60, top: SHOOTER_Y + 24,
        transform: 'translate(-50%, 0)',
        fontSize: 9, fontWeight: 800,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        zIndex: 12,
      }}>swap</div>
    </>
  );
}

function GameHUD({ level, score, shotsLeft, combo, currentDef }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '10px 12px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 8, pointerEvents: 'none', zIndex: 20,
    }}>
      <div style={{
        background: 'rgba(11,30,91,0.7)', backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '5px 10px', color: 'white',
      }}>
        <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</div>
        <div className="font-display" style={{ fontSize: 18, color: 'var(--brand-gold)', fontWeight: 900, lineHeight: 1 }}>
          {score.toLocaleString()}
        </div>
        {combo > 1 && (
          <div style={{ fontSize: 8, fontWeight: 800, color: 'var(--brand-gold)', marginTop: 1 }}>×{combo} COMBO</div>
        )}
      </div>

      <div style={{
        background: 'rgba(11,30,91,0.7)', backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '5px 10px', color: 'white',
        textAlign: 'center', maxWidth: 140,
      }}>
        <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Aiming</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: currentDef.glow, lineHeight: 1.1 }}>
          {currentDef.product}
        </div>
      </div>

      <div style={{
        background: 'rgba(11,30,91,0.7)', backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '5px 10px', color: 'white', textAlign: 'right',
      }}>
        <div style={{ fontSize: 8, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shots</div>
        <div className="font-display" style={{
          fontSize: 18, fontWeight: 900, lineHeight: 1,
          color: shotsLeft <= 3 ? '#EF4444' : 'white',
        }}>
          {shotsLeft}
        </div>
      </div>
    </div>
  );
}
