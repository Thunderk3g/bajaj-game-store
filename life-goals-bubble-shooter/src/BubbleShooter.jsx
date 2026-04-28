// BubbleShooter.jsx — classic bubble shooter with sliding ammo queue.
// Match 3+ same colour to clear. Hex grid, ceiling drops every N shots.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { COLORS } from './data.js';

const BUBBLE_R = 22;
const BUBBLE_D = BUBBLE_R * 2;
const ROW_H = BUBBLE_D * 0.866;
const COLS = 8;
export const GAME_W = COLS * BUBBLE_D + BUBBLE_R; // 374
export const GAME_H = 600;
const SHOOTER_Y = GAME_H - 50;        // 550
const SHOT_SPEED = 16;
const DROP_INTERVAL = 6;              // ceiling drops every 6 shots
const DROP_DIST = ROW_H;
const LOSE_LINE = SHOOTER_Y - 80;     // 470

const QUEUE_LEN = 5; // 4 visible (current, next, q1, q2) + 1 incoming buffer
const HUD_BAR_H = 56;
const QUEUE_STRIP_H = 60;

function gridToPx(row, col, ceilingDrop) {
  const x = BUBBLE_R + col * BUBBLE_D + (row % 2 === 1 ? BUBBLE_R : 0);
  const y = BUBBLE_R + 8 + row * ROW_H + ceilingDrop;
  return { x, y };
}

function ammoSlot(idx, queueY) {
  // Returns the absolute (x, y) and visual scale for ammo at queue index `idx`.
  // 0 = cannon, 1 = next/swap (right of cannon), 2/3 = queue strip, 4 = off-screen incoming.
  switch (idx) {
    case 0: return { x: GAME_W / 2, y: SHOOTER_Y, scale: 1.0 };
    case 1: return { x: GAME_W / 2 + 58, y: SHOOTER_Y, scale: 0.66 };
    case 2: return { x: 94, y: queueY, scale: 0.55 };
    case 3: return { x: 124, y: queueY, scale: 0.5 };
    case 4: return { x: GAME_W + 50, y: queueY, scale: 0.45 };
    default: return { x: GAME_W + 200, y: queueY, scale: 0.4 };
  }
}

function buildInitialBubbles(level) {
  const out = [];
  const colors = level.colors;
  const rows = level.rows;
  for (let row = 0; row < rows; row++) {
    const cols = row % 2 === 1 ? COLS - 1 : COLS;
    for (let col = 0; col < cols; col++) {
      if (row >= rows - 2 && Math.random() < 0.35) continue;
      const colorId = colors[Math.floor(Math.random() * colors.length)];
      const { x, y } = gridToPx(row, col, 0);
      out.push({ id: `b${row}-${col}`, colorId, row, col, x, y, state: 'alive' });
    }
  }
  return out;
}

function buildInitialQueue(level) {
  const colors = level.colors;
  return Array.from({ length: QUEUE_LEN }, (_, i) => ({
    id: `ammo-init-${i}-${Math.random().toString(36).slice(2, 8)}`,
    colorId: colors[i % colors.length],
  }));
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

function AmmoBall({ ammo, idx, queueY, projectileActive, onSwap, justLoadedId }) {
  const colorDef = COLORS[ammo.colorId];
  const slot = ammoSlot(idx, queueY);
  const size = BUBBLE_D * slot.scale;
  const bg = `radial-gradient(circle at 32% 28%, ${colorDef.glow} 0%, ${colorDef.color} 45%, ${colorDef.colorDeep} 100%)`;

  const hidden = idx === 0 && projectileActive;
  const isSwapSlot = idx === 1;
  const justLoaded = justLoadedId === ammo.id;

  const cls = [
    'ammo-ball',
    isSwapSlot ? 'is-swap' : '',
    justLoaded ? 'is-loaded' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      onClick={isSwapSlot ? onSwap : undefined}
      style={{
        left: slot.x,
        top: slot.y,
        width: size,
        height: size,
        background: bg,
        opacity: hidden ? 0 : 1,
        zIndex: idx === 0 ? 14 : (13 - idx),
      }}
      title={isSwapSlot ? 'Tap to swap' : undefined}
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

  const [ammoQueue, setAmmoQueue] = useState(() => buildInitialQueue(level));
  const [justLoadedId, setJustLoadedId] = useState(null);

  const [projectile, setProjectile] = useState(null);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [aiming, setAiming] = useState(false);
  const [scorePops, setScorePops] = useState([]);
  const [bursts, setBursts] = useState([]);

  const containerRef = useRef(null);
  const playfieldRef = useRef(null);
  const rafRef = useRef(null);
  const finishedRef = useRef(false);

  // Measured top of the playfield within the outer container. We use this to
  // position the ammo overlay so it always lines up with the playfield's true
  // top — regardless of whether the HUD bar grows past HUD_BAR_H (e.g. when
  // the combo line appears in the score chip).
  const [ammoLayerTop, setAmmoLayerTop] = useState(HUD_BAR_H);

  useLayoutEffect(() => {
    if (!playfieldRef.current) return;
    const measure = () => {
      if (playfieldRef.current) {
        setAmmoLayerTop(playfieldRef.current.offsetTop);
      }
    };
    measure();
    let ro;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

  // Recompute when the combo changes (it can add/remove a line in the HUD).
  useLayoutEffect(() => {
    if (playfieldRef.current) {
      setAmmoLayerTop(playfieldRef.current.offsetTop);
    }
  }, [combo]);

  const queueY = GAME_H + 30;

  const pickColor = useCallback((excludeId) => {
    const pool = availableColors.length ? availableColors : level.colors;
    const filtered = excludeId ? pool.filter(c => c !== excludeId) : pool;
    const arr = filtered.length ? filtered : pool;
    return arr[Math.floor(Math.random() * arr.length)];
  }, [availableColors, level.colors]);

  const cycleAmmo = useCallback(() => {
    setAmmoQueue(prev => {
      const newColor = pickColor(prev[prev.length - 1]?.colorId);
      const next = [
        ...prev.slice(1),
        { id: `ammo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, colorId: newColor },
      ];
      setJustLoadedId(next[0]?.id || null);
      return next;
    });
  }, [pickColor]);

  const swapAmmo = useCallback(() => {
    if (projectile) return;
    setAmmoQueue(prev => {
      if (prev.length < 2) return prev;
      const [a, b, ...rest] = prev;
      return [b, a, ...rest];
    });
  }, [projectile]);

  // Clear the "just loaded" pulse class shortly after it fires.
  useEffect(() => {
    if (!justLoadedId) return;
    const t = setTimeout(() => setJustLoadedId(null), 360);
    return () => clearTimeout(t);
  }, [justLoadedId]);

  // Keep ammo within still-available colours after the board changes.
  useEffect(() => {
    setAmmoQueue(prev => {
      let changed = false;
      const next = prev.map(a => {
        if (availableColors.includes(a.colorId)) return a;
        changed = true;
        return { ...a, colorId: availableColors[Math.floor(Math.random() * availableColors.length)] };
      });
      return changed ? next : prev;
    });
  }, [availableColors]);

  const onPointerMove = useCallback((e) => {
    if (!playfieldRef.current) return;
    const rect = playfieldRef.current.getBoundingClientRect();
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

  const fireShot = useCallback(() => {
    if (projectile || finishedRef.current) { setAiming(false); return; }
    if (shotsLeft <= 0) { setAiming(false); return; }
    const currentColor = ammoQueue[0]?.colorId;
    if (!currentColor) { setAiming(false); return; }
    setProjectile({
      x: GAME_W / 2,
      y: SHOOTER_Y,
      vx: Math.cos(aimAngle) * SHOT_SPEED,
      vy: Math.sin(aimAngle) * SHOT_SPEED,
      colorId: currentColor,
    });
    cycleAmmo();
    setAiming(false);
  }, [aimAngle, ammoQueue, projectile, shotsLeft, cycleAmmo]);

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
  }, [ceilingDrop, combo]);

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

  const currentDef = COLORS[ammoQueue[0]?.colorId || level.colors[0]];

  return (
    <div
      ref={containerRef}
      className="no-touch"
      style={{
        position: 'relative',
        width: GAME_W,
        margin: '0 auto',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(255,255,255,0.10)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HUD bar — sits ABOVE the playfield, not on top of it.
          Each tile is a glass `.ls-chip`, matching the stackibility design system.
          minHeight (instead of fixed height) lets the bar grow if a chip's
          content (e.g. the combo line) needs more room. The ammo overlay
          measures the playfield's actual offsetTop to stay in sync. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr',
          gap: 8,
          padding: '8px 10px',
          minHeight: HUD_BAR_H,
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(5,26,58,0.92) 0%, rgba(5,26,58,0.98) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="ls-chip"
          style={{
            padding: '6px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div className="hud-label">Score</div>
          <div className="ls-num" style={{ fontSize: 18, lineHeight: 1, marginTop: 2 }}>
            {score.toLocaleString()}
          </div>
          {combo > 1 && (
            <div style={{
              fontSize: 8, fontWeight: 800, marginTop: 2,
              color: 'var(--ls-orange-bright)', letterSpacing: '0.18em',
            }}>
              ×{combo} COMBO
            </div>
          )}
        </div>

        <div
          className="ls-chip"
          style={{
            padding: '6px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            className="hud-label"
            style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: currentDef.color,
                boxShadow: `0 0 6px ${currentDef.glow}`,
              }}
            />
            Aiming
          </div>
          <div style={{
            fontSize: 12, fontWeight: 800,
            color: 'var(--ls-white)', lineHeight: 1.15, marginTop: 2,
            letterSpacing: '-0.01em',
          }}>
            {currentDef.product}
          </div>
        </div>

        <div
          className="ls-chip"
          style={{
            padding: '6px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            textAlign: 'right',
          }}
        >
          <div className="hud-label">Shots</div>
          <div
            className="ls-num"
            style={{
              fontSize: 18, lineHeight: 1, marginTop: 2,
              color: shotsLeft <= 3 ? 'var(--ls-danger)' : 'var(--ls-white)',
            }}
          >
            {shotsLeft}
          </div>
        </div>
      </div>

      {/* Playfield */}
      <div
        ref={playfieldRef}
        style={{
          position: 'relative',
          width: GAME_W,
          height: GAME_H,
          background: 'linear-gradient(180deg, #051a3a 0%, #0e4f94 60%, #005BAC 100%)',
          overflow: 'hidden',
        }}
        onMouseMove={onPointerMove}
        onMouseUp={fireShot}
        onMouseLeave={() => setAiming(false)}
        onTouchMove={(e) => { const t = e.touches[0]; onPointerMove({ clientX: t.clientX, clientY: t.clientY }); }}
        onTouchEnd={fireShot}
      >
        <div className="starfield" style={{ position: 'absolute', inset: 0, opacity: 0.55 }} />

        {/* Ceiling line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: ceilingDrop, height: 4,
          background: 'linear-gradient(180deg, rgba(255,133,51,0.6), transparent)',
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

        {/* Cannon line + glow */}
        <CannonBase aimAngle={aimAngle} />
      </div>

      {/* Queue strip — sits below the playfield */}
      <div className="queue-strip" style={{ height: QUEUE_STRIP_H }}>
        <div className="queue-label">
          Up Next<span className="next-arrow">→</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="tap-hint-label">Tap right ball to swap</div>
      </div>

      {/* Ammo balls — absolutely positioned across playfield + queue strip.
          Wrapped in a layer that starts where the playfield does, so coordinates
          are playfield-relative (y=0 is top of playfield). */}
      <div style={{
        position: 'absolute',
        top: HUD_BAR_H,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}>
        {ammoQueue.map((ammo, idx) => (
          <AmmoBall
            key={ammo.id}
            ammo={ammo}
            idx={idx}
            queueY={queueY}
            projectileActive={!!projectile}
            onSwap={swapAmmo}
            justLoadedId={justLoadedId}
          />
        ))}
      </div>
    </div>
  );
}

function CannonBase({ aimAngle }) {
  const cannonLen = 34;
  const tipX = GAME_W / 2 + Math.cos(aimAngle) * cannonLen;
  const tipY = SHOOTER_Y + Math.sin(aimAngle) * cannonLen;
  return (
    <>
      <svg width={GAME_W} height={GAME_H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="cannonGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF8533" />
            <stop offset="100%" stopColor="#F26922" />
          </linearGradient>
        </defs>
        <line x1={GAME_W / 2} y1={SHOOTER_Y} x2={tipX} y2={tipY}
          stroke="url(#cannonGrad)" strokeWidth="12" strokeLinecap="round" />
      </svg>

      <div className="shooter-glow" style={{
        position: 'absolute', left: GAME_W / 2, top: SHOOTER_Y,
        transform: 'translate(-50%, -50%)',
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 28%, rgba(255,133,51,0.55) 0%, rgba(242,105,34,0.35) 50%, transparent 75%)',
        zIndex: 9,
      }} />
    </>
  );
}
