import React, { useState, useEffect, useRef } from 'react';
import { GameResult } from '../types';
import { ORANGE, MAX_LIVES, GAME_SECS, COLS, BRICK_DEFS, ROWS, TOTAL_BRICKS } from '../constants';

interface Brick {
  x: number; y: number; w: number; h: number;
  hitsLeft: number; maxHits: number;
  color: string; glow: string; label: string;
  pts: number; row: number;
  active: boolean; flashT: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  r: number; color: string; life: number;
}

interface GS {
  W: number; H: number;
  PAD_W: number; PAD_H: number;
  BALL_R: number; BH: number; BW: number; GAP: number;
  paddle: { x: number; y: number; w: number; h: number };
  ball:   { x: number; y: number; vx: number; vy: number; r: number };
  bricks: Brick[];
  baseSpeed: number; speedMul: number;
  lives: number; score: number;
  bricksCleared: number; ballsLost: number;
  launched: boolean; over: boolean; won: boolean;
  startT: number;
  particles: Particle[];
}

interface HudState {
  lives: number; timeLeft: number; score: number; launched: boolean;
}

interface Props {
  onGameEnd: (result: GameResult) => void;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function buildState(W: number, H: number): GS {
  const PAD_W  = Math.round(W * 0.22);
  const PAD_H  = 12;
  const BALL_R = Math.max(6, Math.round(W * 0.015));
  const GAP    = 5;
  const TOP    = 70;
  const BH     = Math.floor((H * 0.47 - GAP * (ROWS + 1)) / ROWS);
  const BW     = Math.floor((W - GAP * (COLS + 1)) / COLS);

  const bricks: Brick[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const def = BRICK_DEFS[r];
      bricks.push({
        x: GAP + c * (BW + GAP), y: TOP + GAP + r * (BH + GAP),
        w: BW, h: BH,
        hitsLeft: def.hits, maxHits: def.hits,
        color: def.color, glow: def.glow, label: def.label,
        pts: def.pts, row: r,
        active: true, flashT: 0,
      });
    }
  }

  const baseSpeed = W * 0.0058;
  return {
    W, H, PAD_W, PAD_H, BALL_R, BH, BW, GAP,
    paddle:  { x: (W - PAD_W) / 2, y: H - 55, w: PAD_W, h: PAD_H },
    ball:    { x: W / 2, y: H - 80, vx: baseSpeed * 0.65, vy: -baseSpeed, r: BALL_R },
    bricks,
    baseSpeed, speedMul: 1,
    lives: MAX_LIVES, score: 0,
    bricksCleared: 0, ballsLost: 0,
    launched: false, over: false, won: false,
    startT: Date.now(),
    particles: [],
  };
}

function draw(ctx: CanvasRenderingContext2D, gs: GS) {
  const { W, H } = gs;

  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#000f3a');
  bg.addColorStop(1, '#001a6e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  gs.bricks.forEach(b => {
    if (!b.active) return;
    const alpha = b.flashT > 0 ? 1 : 0.45 + 0.55 * (b.hitsLeft / b.maxHits);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (b.hitsLeft === b.maxHits) { ctx.shadowBlur = 6; ctx.shadowColor = b.glow; }
    roundRect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fillStyle = b.flashT > 0 ? '#ffffff' : b.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.8;
    roundRect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.stroke();
    ctx.globalAlpha = Math.max(0.5, alpha);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    const fs = Math.min(8, b.h * 0.44);
    ctx.font = `700 ${fs}px Plus Jakarta Sans, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label.split('\n')[0].substring(0, 5), b.x + b.w / 2, b.y + b.h / 2);
    if (b.hitsLeft > 1) {
      ctx.font = `600 ${fs - 1}px Plus Jakarta Sans, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('×' + b.hitsLeft, b.x + b.w - 7, b.y + 7);
    }
    ctx.restore();
  });

  gs.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const pg = ctx.createLinearGradient(gs.paddle.x, gs.paddle.y, gs.paddle.x, gs.paddle.y + gs.PAD_H);
  pg.addColorStop(0, '#FF7A3A');
  pg.addColorStop(1, ORANGE);
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(242,101,34,0.6)';
  roundRect(ctx, gs.paddle.x, gs.paddle.y, gs.paddle.w, gs.PAD_H, 7);
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.shadowBlur = 0;
  roundRect(ctx, gs.paddle.x + 5, gs.paddle.y + 2, gs.paddle.w - 10, gs.PAD_H * 0.38, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#7DD3FC';
  const ballG = ctx.createRadialGradient(
    gs.ball.x - gs.ball.r * 0.3, gs.ball.y - gs.ball.r * 0.35, gs.ball.r * 0.05,
    gs.ball.x, gs.ball.y, gs.ball.r
  );
  ballG.addColorStop(0, '#ffffff');
  ballG.addColorStop(0.45, '#BAE6FD');
  ballG.addColorStop(1, '#38BDF8');
  ctx.beginPath();
  ctx.arc(gs.ball.x, gs.ball.y, gs.ball.r, 0, Math.PI * 2);
  ctx.fillStyle = ballG;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  if (!gs.launched) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap or click to launch ▸', W / 2, H - 22);
    ctx.textAlign = 'left';
  }
}

function update(gs: GS, endGame: (won: boolean) => void) {
  if (gs.over || !gs.launched) return;

  const { ball, paddle } = gs;

  gs.particles = gs.particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.04 }))
    .filter(p => p.life > 0);

  gs.bricks.forEach(b => { if (b.flashT > 0) b.flashT = Math.max(0, b.flashT - 0.15); });

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0)    { ball.x = ball.r;       ball.vx =  Math.abs(ball.vx); }
  if (ball.x + ball.r > gs.W) { ball.x = gs.W - ball.r; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - ball.r < 0)    { ball.y = ball.r;       ball.vy =  Math.abs(ball.vy); }

  if (
    ball.vy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y + ball.r <= paddle.y + paddle.h + Math.abs(ball.vy) + 2 &&
    ball.x + ball.r >= paddle.x &&
    ball.x - ball.r <= paddle.x + paddle.w
  ) {
    const hit = (ball.x - paddle.x) / paddle.w;
    const ang = (hit - 0.5) * Math.PI * 0.75;
    const spd = Math.hypot(ball.vx, ball.vy);
    ball.vx = Math.sin(ang) * spd;
    ball.vy = -Math.abs(Math.cos(ang) * spd);
    ball.y  = paddle.y - ball.r - 0.5;
  }

  if (ball.y - ball.r > gs.H) {
    gs.lives--;
    gs.ballsLost++;
    if (gs.lives <= 0) { endGame(false); return; }
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r - 5;
    const sp = gs.baseSpeed * gs.speedMul;
    ball.vx = sp * 0.65 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -sp;
    gs.launched = false;
  }

  let active = 0;
  for (let i = 0; i < gs.bricks.length; i++) {
    const b = gs.bricks[i];
    if (!b.active) continue;
    active++;
    const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
    const dx = ball.x - cx, dy = ball.y - cy;
    if (dx * dx + dy * dy >= ball.r * ball.r) continue;

    b.hitsLeft--;
    b.flashT = 1;
    for (let p = 0; p < 5; p++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 2;
      gs.particles.push({ x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 2 + Math.random() * 2, color: b.color, life: 1 });
    }
    if (b.hitsLeft <= 0) {
      b.active = false;
      gs.bricksCleared++;
      gs.score += b.pts;
      active--;
      if (gs.bricksCleared % 8 === 0) {
        gs.speedMul = Math.min(2.0, gs.speedMul + 0.12);
        const cur = Math.hypot(ball.vx, ball.vy);
        const nxt = Math.min(cur * 1.1, gs.baseSpeed * 2.0);
        const ratio = nxt / cur;
        ball.vx *= ratio;
        ball.vy *= ratio;
      }
    }
    const overlapLeft  = (ball.x + ball.r) - b.x;
    const overlapRight = (b.x + b.w) - (ball.x - ball.r);
    const overlapTop   = (ball.y + ball.r) - b.y;
    const overlapBot   = (b.y + b.h) - (ball.y - ball.r);
    if (Math.min(overlapLeft, overlapRight) < Math.min(overlapTop, overlapBot)) ball.vx = -ball.vx;
    else ball.vy = -ball.vy;
    break;
  }

  if (active === 0) endGame(true);
}

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef     = useRef<GS | null>(null);
  const rafRef    = useRef<number>(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const [hud, setHud] = useState<HudState>({ lives: MAX_LIVES, timeLeft: GAME_SECS, score: 0, launched: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = Math.min(window.innerWidth, 480);
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const gs = buildState(W, H);
    gsRef.current = gs;

    function endGame(won: boolean) {
      const g = gsRef.current;
      if (!g || g.over) return;
      g.over = true;
      g.won  = won;
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => onGameEnd({
        bricksCleared:  g.bricksCleared,
        totalBricks:    TOTAL_BRICKS,
        ballsLost:      g.ballsLost,
        livesRemaining: g.lives,
        timeSeconds:    Math.min(GAME_SECS, Math.round((Date.now() - g.startT) / 1000)),
        rawScore:       g.score,
        won,
      }), 500);
    }

    timerRef.current = setInterval(() => {
      const g = gsRef.current;
      if (!g || g.over) return;
      const elapsed = Math.floor((Date.now() - g.startT) / 1000);
      const left    = Math.max(0, GAME_SECS - elapsed);
      setHud(h => ({ ...h, timeLeft: left, score: g.score, lives: g.lives, launched: g.launched }));
      if (left <= 0) endGame(false);
    }, 250);

    function movePaddle(clientX: number, rect: DOMRect) {
      const g = gsRef.current;
      if (!g || g.over) return;
      const x = (clientX - rect.left) * (canvas!.width / rect.width);
      g.paddle.x = Math.max(0, Math.min(g.W - g.paddle.w, x - g.paddle.w / 2));
      if (!g.launched) g.ball.x = g.paddle.x + g.paddle.w / 2;
    }

    const onMouseMove  = (e: MouseEvent)     => movePaddle(e.clientX, canvas.getBoundingClientRect());
    const onClick      = ()                  => { const g = gsRef.current; if (g && !g.launched && !g.over) g.launched = true; };
    const onTouchMove  = (e: TouchEvent)     => { e.preventDefault(); movePaddle(e.touches[0].clientX, canvas.getBoundingClientRect()); };
    const onTouchStart = (e: TouchEvent)     => { e.preventDefault(); movePaddle(e.touches[0].clientX, canvas.getBoundingClientRect()); const g = gsRef.current; if (g && !g.launched && !g.over) g.launched = true; };
    const onKeyDown    = (e: KeyboardEvent)  => {
      const g = gsRef.current;
      if (!g || g.over) return;
      const step = g.W * 0.04;
      if (e.key === 'ArrowLeft')  { g.paddle.x = Math.max(0, g.paddle.x - step); if (!g.launched) g.ball.x = g.paddle.x + g.paddle.w / 2; }
      if (e.key === 'ArrowRight') { g.paddle.x = Math.min(g.W - g.paddle.w, g.paddle.x + step); if (!g.launched) g.ball.x = g.paddle.x + g.paddle.w / 2; }
      if (e.key === ' ')          { if (!g.launched) g.launched = true; }
    };

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('click',      onClick);
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('keydown',    onKeyDown);

    function loop() {
      const g = gsRef.current;
      if (!g) return;
      update(g, endGame);
      draw(ctx, g);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('click',      onClick);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown',    onKeyDown);
    };
  }, []);

  const tl     = hud.timeLeft;
  const mm     = String(Math.floor(tl / 60)).padStart(2, '0');
  const ss     = String(tl % 60).padStart(2, '0');
  const urgent = tl <= 20;

  return (
    <div style={{ background: '#000f3a', width: '100%', height: '100vh', position: 'relative' }}>
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      >
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className="text-base" style={{ opacity: i < hud.lives ? 1 : 0.18 }}>❤️</span>
          ))}
        </div>
        <div className="text-white font-extrabold text-sm">🛡️ {hud.score}</div>
        <div
          className={`font-extrabold text-sm ${urgent ? 'text-red-400' : 'text-white'}`}
          style={urgent ? { animation: 'pop 0.5s ease-out infinite alternate' } : {}}
        >
          ⏱ {mm}:{ss}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'none' }} />
    </div>
  );
};

export default GameScreen;
