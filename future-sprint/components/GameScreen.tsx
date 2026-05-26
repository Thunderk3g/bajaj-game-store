import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameResult } from '../types';
import { TARGET_DISTANCE, INITIAL_SPEED, MAX_SPEED, SPEED_RAMP_SECS, PLAYER_LIVES } from '../constants';
import HowToPlayPopup from './HowToPlayPopup';

import imgChildF1Src from '../src/assets/child_runner_f1.png';
import imgChildF2Src from '../src/assets/child_runner_f2.png';
import imgChildF3Src from '../src/assets/child_runner_f3.png';
import imgChildF4Src from '../src/assets/child_runner_f4.png';
import imgChildF5Src from '../src/assets/child_runner_f5.png';
import imgChildF6Src from '../src/assets/child_runner_f6.png';
import imgChildF7Src from '../src/assets/child_runner_f7.png';
import imgChildF8Src from '../src/assets/child_runner_f8.png';
import imgIllnessSrc  from '../src/assets/obstacle_illness.png';
import imgAccidentSrc from '../src/assets/obstacle_accident.png';
import imgDebtSrc     from '../src/assets/obstacle_debt.png';
import imgCoinSrc     from '../src/assets/coin_savings.png';
import imgShieldSrc   from '../src/assets/powerup_shield.png';

// ── Audio ─────────────────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
let _masterGain: GainNode | null = null;

function getAudioCtx(): AudioContext {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    _masterGain = _audioCtx.createGain();
    _masterGain.gain.value = 1;
    _masterGain.connect(_audioCtx.destination);
  }
  return _audioCtx;
}

function playTone(freq: number, type: OscillatorType, vol: number, dur: number, delay = 0) {
  try {
    const ctx = getAudioCtx();
    if (!_masterGain) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(_masterGain);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.01);
  } catch (_) {}
}

function playSFX(name: 'jump' | 'coin' | 'hit' | 'shield' | 'over' | 'win') {
  if (name === 'jump')   { playTone(440,'sine',0.22,0.1); playTone(660,'sine',0.15,0.1,0.08); }
  if (name === 'coin')   { playTone(880,'sine',0.18,0.07); playTone(1100,'sine',0.18,0.07,0.07); }
  if (name === 'hit')    { playTone(200,'sawtooth',0.3,0.18); playTone(140,'square',0.2,0.14,0.1); }
  if (name === 'shield') { [523,659,784,1047].forEach((f,i)=>playTone(f,'sine',0.2,0.14,i*0.07)); }
  if (name === 'over')   { [220,170,130].forEach((f,i)=>playTone(f,'sawtooth',0.28,0.4,i*0.3)); }
  if (name === 'win')    { [523,659,784,1047,1319].forEach((f,i)=>playTone(f,'sine',0.22,0.28,i*0.14)); }
}

function setAudioMuted(m: boolean) {
  try {
    const ctx = getAudioCtx();
    if (_masterGain) _masterGain.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05);
  } catch (_) {}
}

// ── Game constants ─────────────────────────────────────────────────────
const CW = 360;
const CH = 640;
const GROUND_Y    = CH - 90;   // y where ground surface sits
const GRAVITY     = 1850;      // px/s²
const JUMP_V      = -640;      // px/s initial jump velocity
const DBLJ_V      = -510;      // double-jump velocity
const PLAYER_W    = 46;
const PLAYER_H    = 54;
const PLAYER_X    = 68;
const SHIELD_DUR  = 3.5;       // seconds shield lasts
const INV_DUR     = 1.8;       // seconds invincibility after hit

type ObsType = 'illness' | 'accident' | 'debt';

const OBS_CFG: Record<ObsType, { w: number; h: number; color: string }> = {
  illness:  { w: 40, h: 44, color: '#EF4444' },
  accident: { w: 50, h: 70, color: '#F97316' },
  debt:     { w: 44, h: 96, color: '#8B5CF6' },
};

interface PPlayer { x:number; y:number; vy:number; onGround:boolean; canDbl:boolean; jumps:number; lives:number; inv:number; shield:number }
interface Obs     { x:number; y:number; w:number; h:number; type:ObsType; alive:boolean }
interface Coin    { x:number; y:number; alive:boolean }
interface PUp     { x:number; y:number; alive:boolean }
interface Cloud   { x:number; y:number; w:number; spd:number }
interface Ptcl    { x:number; y:number; vx:number; vy:number; r:number; alpha:number; color:string; life:number }

// ── Component ──────────────────────────────────────────────────────────
interface Props { onGameEnd: (r: GameResult) => void }

const GameScreen: React.FC<Props> = ({ onGameEnd }) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showHTP, setShowHTP]   = useState(true);
  const [muted,   setMuted]     = useState(false);
  const [hud, setHud] = useState({ lives: PLAYER_LIVES, dist: 0, coins: 0, shield: 0 });

  // mutable game state (no re-render)
  const P       = useRef<PPlayer>({ x:PLAYER_X, y:GROUND_Y-PLAYER_H, vy:0, onGround:true, canDbl:false, jumps:0, lives:PLAYER_LIVES, inv:0, shield:0 });
  const obs     = useRef<Obs[]>([]);
  const coins   = useRef<Coin[]>([]);
  const pups    = useRef<PUp[]>([]);
  const ptcls   = useRef<Ptcl[]>([]);
  const clouds  = useRef<Cloud[]>([]);
  const gItems  = useRef<{x:number;h:number;c:string}[]>([]);

  const phase         = useRef<'playing'|'over'|'win'>('playing');
  const started       = useRef(false);
  const endFired      = useRef(false);
  const rafId         = useRef(0);
  const lastTs        = useRef(0);

  const elapsed       = useRef(0);
  const scrollSpd     = useRef(INITIAL_SPEED);
  const distM         = useRef(0);  // metres
  const coinsGot      = useRef(0);
  const obstDodged    = useRef(0);
  const shieldsUsed   = useRef(0);
  const livesLost     = useRef(0);

  const nextObs       = useRef(2.0);
  const nextCoin      = useRef(1.2);
  const nextPup       = useRef(20.0);

  const bgOff         = useRef(0);
  const gndOff        = useRef(0);
  const runT          = useRef(0);

  const sprites = useRef<Record<string, HTMLImageElement>>({});

  // load sprites
  useEffect(() => {
    ([['child_f1',imgChildF1Src],['child_f2',imgChildF2Src],['child_f3',imgChildF3Src],
      ['child_f4',imgChildF4Src],['child_f5',imgChildF5Src],['child_f6',imgChildF6Src],
      ['child_f7',imgChildF7Src],['child_f8',imgChildF8Src],
      ['illness',imgIllnessSrc],['accident',imgAccidentSrc],
      ['debt',imgDebtSrc],['coin',imgCoinSrc],['shield',imgShieldSrc]] as [string,string][])
      .forEach(([k,s])=>{ const i=new Image(); i.src=s; sprites.current[k]=i; });
  }, []);

  // scale canvas to container
  useEffect(() => {
    const scale = () => {
      const cv = canvasRef.current, ct = containerRef.current;
      if (!cv||!ct) return;
      const { width, height } = ct.getBoundingClientRect();
      const f = Math.min(width/CW, height/CH);
      cv.style.width=`${CW*f}px`; cv.style.height=`${CH*f}px`;
    };
    scale(); window.addEventListener('resize', scale);
    return () => window.removeEventListener('resize', scale);
  }, []);

  // ── helpers ──────────────────────────────────────────────────────────
  function spawnPtcls(x:number, y:number, color:string, n=8) {
    for (let i=0;i<n;i++) ptcls.current.push({
      x, y,
      vx:(Math.random()-0.5)*200, vy:-Math.random()*240-40,
      r:3+Math.random()*4, alpha:1, color, life:0.5+Math.random()*0.4,
    });
  }

  function doJump() {
    const p = P.current;
    if (p.onGround) {
      p.vy=JUMP_V; p.onGround=false; p.canDbl=true; p.jumps=1;
      playSFX('jump');
    } else if (p.canDbl && p.jumps<2) {
      p.vy=DBLJ_V; p.jumps=2; p.canDbl=false;
      playSFX('jump');
      spawnPtcls(p.x+PLAYER_W/2, p.y+PLAYER_H, '#FCD34D', 5);
    }
  }

  function fireEnd() {
    if (endFired.current) return;
    endFired.current = true;
    cancelAnimationFrame(rafId.current);

    const timeSeconds = Math.round(elapsed.current);
    const distance    = Math.round(distM.current);
    const c           = coinsGot.current;
    const gains       = c * 500;
    const losses      = livesLost.current * 400;
    const rawScore    = distance + c * 200;
    const TARGET_RAW  = TARGET_DISTANCE + 30*200;
    const portfolio   = Math.min(100, Math.round((rawScore / TARGET_RAW) * 100));

    onGameEnd({ portfolio, distance, coinsCollected:c, obstaclesDodged:obstDodged.current,
      livesRemaining:P.current.lives, shieldsUsed:shieldsUsed.current,
      timeSeconds, gains, losses, rawScore });
  }

  function initScene() {
    clouds.current = Array.from({length:6},(_,i)=>({
      x:i*70, y:30+Math.random()*80,
      w:55+Math.random()*55, spd:18+Math.random()*14,
    }));
    gItems.current = Array.from({length:14},(_,i)=>({
      x:i*28+Math.random()*12, h:10+Math.random()*18,
      c: i%3===0 ? '#1FAD40' : '#28A745',
    }));
  }

  function startGame() {
    if (started.current) return;
    started.current = true;
    P.current = {x:PLAYER_X,y:GROUND_Y-PLAYER_H,vy:0,onGround:true,canDbl:false,jumps:0,
      lives:PLAYER_LIVES,inv:0,shield:0};
    obs.current=[]; coins.current=[]; pups.current=[]; ptcls.current=[];
    phase.current='playing'; endFired.current=false;
    elapsed.current=0; scrollSpd.current=INITIAL_SPEED; distM.current=0;
    coinsGot.current=0; obstDodged.current=0; shieldsUsed.current=0; livesLost.current=0;
    nextObs.current=2.0; nextCoin.current=1.2; nextPup.current=20.0;
    bgOff.current=0; gndOff.current=0; runT.current=0;
    initScene();
    lastTs.current = performance.now();
    rafId.current = requestAnimationFrame(loop);
  }

  // ── game loop ─────────────────────────────────────────────────────────
  function loop(ts: number) {
    const dt = Math.min((ts - lastTs.current)/1000, 0.05);
    lastTs.current = ts;
    if (phase.current === 'playing') update(dt);
    render();
    if (phase.current === 'playing') rafId.current = requestAnimationFrame(loop);
  }

  function update(dt: number) {
    elapsed.current += dt;
    const t = elapsed.current;

    // scroll speed ramp
    const rampT = Math.min(t / SPEED_RAMP_SECS, 1);
    scrollSpd.current = INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * rampT;
    const spd = scrollSpd.current;

    // distance (metres)
    distM.current += (spd / 5) * dt;

    // background offsets
    bgOff.current  = (bgOff.current  + spd * 0.25 * dt) % 400;
    gndOff.current = (gndOff.current + spd * dt)        % 50;
    runT.current  += dt;

    // clouds
    clouds.current.forEach(c => {
      c.x -= c.spd * dt;
      if (c.x + c.w < 0) { c.x=CW+10; c.y=28+Math.random()*90; c.w=55+Math.random()*55; }
    });

    // ground deco items
    gItems.current.forEach(g => {
      g.x -= spd * dt;
      if (g.x < -20) g.x = CW + Math.random()*60;
    });

    // player physics
    const p = P.current;
    p.vy += GRAVITY * dt;
    p.y  += p.vy * dt;
    const gLvl = GROUND_Y - PLAYER_H;
    if (p.y >= gLvl) { p.y=gLvl; p.vy=0; p.onGround=true; p.canDbl=false; p.jumps=0; }
    else p.onGround = false;
    if (p.inv   > 0) p.inv   -= dt;
    if (p.shield> 0) p.shield -= dt;

    // spawn obstacles
    nextObs.current -= dt;
    if (nextObs.current <= 0) {
      const types: ObsType[] = ['illness','illness','accident','accident','debt'];
      const type = types[Math.floor(Math.random()*types.length)];
      const cfg  = OBS_CFG[type];
      obs.current.push({ x:CW+10, y:GROUND_Y-cfg.h, w:cfg.w, h:cfg.h, type, alive:true });
      // occasional double-obstacle with gap
      if (Math.random() < 0.10) {
        obs.current.push({ x:CW+10+cfg.w+90+Math.random()*50, y:GROUND_Y-OBS_CFG.illness.h,
          w:OBS_CFG.illness.w, h:OBS_CFG.illness.h, type:'illness', alive:true });
      }
      const minI = 1.2;
      const maxI = 3.2 - rampT * 0.9;
      nextObs.current = minI + Math.random() * Math.max(0.2, maxI - minI);
    }

    // spawn coins
    nextCoin.current -= dt;
    if (nextCoin.current <= 0) {
      const cnt  = 3 + Math.floor(Math.random()*3);
      const baseX = CW + 20;
      const coinY = Math.random() < 0.45
        ? GROUND_Y - 14 - 8       // ground-level
        : GROUND_Y - 110 - Math.random()*50; // floating
      for (let i=0;i<cnt;i++) coins.current.push({ x:baseX+i*34, y:coinY, alive:true });
      nextCoin.current = 0.75 + Math.random()*1.0;
    }

    // spawn shield powerup
    nextPup.current -= dt;
    if (nextPup.current <= 0) {
      pups.current.push({ x:CW+20, y:GROUND_Y-155, alive:true });
      nextPup.current = 18 + Math.random()*12;
    }

    // move entities left
    obs.current.forEach(o => { if (o.alive) o.x -= spd*dt; });
    coins.current.forEach(c => { if (c.alive) c.x -= spd*dt; });
    pups.current.forEach(pu => {
      if (pu.alive) { pu.x -= spd*dt; pu.y = (GROUND_Y-155)+Math.sin(t*3.2)*9; }
    });

    // collisions – obstacles
    if (p.inv <= 0) {
      obs.current.forEach(o => {
        if (!o.alive) return;
        const pad = 5;
        const hit = p.x+pad < o.x+o.w-pad && p.x+PLAYER_W-pad > o.x+pad &&
                    p.y+pad < o.y+o.h     && p.y+PLAYER_H > o.y+pad;
        if (!hit) return;
        o.alive = false;
        if (p.shield > 0) {
          p.shield = 0;
          spawnPtcls(o.x+o.w/2, o.y, '#60A5FA', 10);
          playSFX('coin');
        } else {
          p.lives -= 1; livesLost.current += 1; p.inv = INV_DUR;
          playSFX('hit');
          spawnPtcls(p.x+PLAYER_W/2, p.y+PLAYER_H/2, '#F87171', 12);
          if (p.lives <= 0) {
            phase.current = 'over'; playSFX('over');
            setTimeout(fireEnd, 1300);
          }
        }
        setHud(h => ({...h, lives:p.lives, shield:Math.max(0,p.shield)}));
      });
    }

    // collisions – coins
    coins.current.forEach(c => {
      if (!c.alive) return;
      const CR = 14;
      if (Math.abs((p.x+PLAYER_W/2)-c.x)<CR+PLAYER_W/2-6 && Math.abs((p.y+PLAYER_H/2)-c.y)<CR+PLAYER_H/2-6) {
        c.alive=false; coinsGot.current+=1;
        playSFX('coin'); spawnPtcls(c.x, c.y, '#FCD34D', 6);
        setHud(h=>({...h, coins:coinsGot.current}));
      }
    });

    // collisions – shield pup
    pups.current.forEach(pu => {
      if (!pu.alive) return;
      const R = 18;
      if (Math.abs((p.x+PLAYER_W/2)-pu.x)<R+PLAYER_W/2-5 && Math.abs((p.y+PLAYER_H/2)-pu.y)<R+PLAYER_H/2-5) {
        pu.alive=false; p.shield=SHIELD_DUR; shieldsUsed.current+=1;
        playSFX('shield'); spawnPtcls(pu.x, pu.y, '#60A5FA', 12);
        setHud(h=>({...h, shield:p.shield}));
      }
    });

    // cull + count dodged
    obs.current = obs.current.filter(o => {
      if (o.alive && o.x+o.w < PLAYER_X-4) { obstDodged.current+=1; return false; }
      return o.x+o.w > -80;
    });
    coins.current = coins.current.filter(c => c.x > -40);
    pups.current  = pups.current.filter(pu => pu.x > -40);

    // particles
    ptcls.current.forEach(pt => {
      pt.x+=pt.vx*dt; pt.y+=pt.vy*dt; pt.vy+=380*dt;
      pt.life-=dt; pt.alpha=Math.max(0, pt.life/0.7);
    });
    ptcls.current = ptcls.current.filter(pt=>pt.life>0);

    // victory
    if (distM.current >= TARGET_DISTANCE) {
      phase.current = 'win'; playSFX('win');
      setTimeout(fireEnd, 1600);
    }

    // HUD update
    setHud(h => ({...h, lives:p.lives, dist:Math.round(distM.current), shield:Math.max(0,p.shield)}));
  }

  // ── render ────────────────────────────────────────────────────────────
  function render() {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const p = P.current;
    const t = elapsed.current;

    // sky
    const sky = ctx.createLinearGradient(0,0,0,GROUND_Y);
    sky.addColorStop(0,'#3B82F6'); sky.addColorStop(0.5,'#93C5FD'); sky.addColorStop(1,'#BFDBFE');
    ctx.fillStyle=sky; ctx.fillRect(0,0,CW,CH);

    // sun
    ctx.save();
    ctx.shadowColor='#FDE68A'; ctx.shadowBlur=24;
    ctx.beginPath(); ctx.arc(CW-55,52,26,0,Math.PI*2);
    const sg=ctx.createRadialGradient(CW-55,52,0,CW-55,52,26);
    sg.addColorStop(0,'#FFF9C4'); sg.addColorStop(1,'#FCD34D');
    ctx.fillStyle=sg; ctx.fill();
    ctx.restore();

    // clouds
    ctx.fillStyle='rgba(255,255,255,0.85)';
    clouds.current.forEach(cl => {
      ctx.beginPath();
      ctx.ellipse(cl.x,       cl.y,    cl.w/2,14,0,0,Math.PI*2);
      ctx.ellipse(cl.x-cl.w/4, cl.y+5, cl.w/3,11,0,0,Math.PI*2);
      ctx.ellipse(cl.x+cl.w/4, cl.y+5, cl.w/3,11,0,0,Math.PI*2);
      ctx.fill();
    });

    // distant hills (parallax)
    ctx.fillStyle='#6EE7B7';
    ctx.beginPath(); ctx.moveTo(0,GROUND_Y-15);
    const hillOff = bgOff.current * 0.4;
    for (let x=0; x<=CW+80; x+=80) {
      const bx = ((x - hillOff) % (CW+80) + CW+80) % (CW+80) - 40;
      ctx.quadraticCurveTo(bx, GROUND_Y-50-Math.sin(x*0.018)*18, bx+40, GROUND_Y-15);
    }
    ctx.lineTo(CW,GROUND_Y); ctx.lineTo(0,GROUND_Y); ctx.fill();

    // ground
    ctx.fillStyle='#4ADE80'; ctx.fillRect(0,GROUND_Y,CW,CH-GROUND_Y);
    ctx.fillStyle='#22C55E'; ctx.fillRect(0,GROUND_Y,CW,7);
    ctx.fillStyle='#92400E'; ctx.fillRect(0,GROUND_Y+7,CW,13);

    // ground deco
    gItems.current.forEach(g => {
      ctx.fillStyle=g.c;
      ctx.beginPath();
      ctx.ellipse(g.x, GROUND_Y+1, 7, g.h/3, 0, 0, Math.PI*2);
      ctx.fill();
    });

    // coins
    coins.current.forEach(c => {
      if (!c.alive) return;
      const CR=14;
      const sp=sprites.current['coin'];
      if (sp?.complete && sp.naturalWidth>0) { ctx.drawImage(sp,c.x-CR,c.y-CR,CR*2,CR*2); }
      else {
        ctx.beginPath(); ctx.arc(c.x,c.y,CR,0,Math.PI*2);
        const cg=ctx.createRadialGradient(c.x,c.y,2,c.x,c.y,CR);
        cg.addColorStop(0,'#FEF9C3'); cg.addColorStop(1,'#FCD34D');
        ctx.fillStyle=cg; ctx.fill();
        ctx.strokeStyle='#F59E0B'; ctx.lineWidth=1.5; ctx.stroke();
      }
    });

    // shield powerup
    pups.current.forEach(pu => {
      if (!pu.alive) return;
      const R=18; const pulse=1+Math.sin(t*4)*0.12;
      ctx.save(); ctx.shadowColor='#60A5FA'; ctx.shadowBlur=16;
      const sp=sprites.current['shield'];
      if (sp?.complete && sp.naturalWidth>0) {
        const s=R*2*pulse; ctx.drawImage(sp,pu.x-s/2,pu.y-s/2,s,s);
      } else {
        ctx.beginPath(); ctx.arc(pu.x,pu.y,R*pulse,0,Math.PI*2);
        const pg=ctx.createRadialGradient(pu.x,pu.y,0,pu.x,pu.y,R*pulse);
        pg.addColorStop(0,'#93C5FD'); pg.addColorStop(1,'#3B82F6');
        ctx.fillStyle=pg; ctx.fill();
      }
      ctx.restore();
    });

    // obstacles
    obs.current.forEach(o => {
      if (!o.alive) return;
      const sp=sprites.current[o.type];
      if (sp?.complete && sp.naturalWidth>0) { ctx.drawImage(sp,o.x,o.y,o.w,o.h); }
      else {
        ctx.fillStyle=OBS_CFG[o.type].color; ctx.fillRect(o.x,o.y,o.w,o.h);
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1.5; ctx.strokeRect(o.x,o.y,o.w,o.h);
      }
    });

    // player
    const bob = p.onGround ? Math.sin(runT.current*11)*2 : 0;
    const drawY = p.y + bob;

    // shield aura
    if (p.shield > 0) {
      ctx.save();
      ctx.shadowColor='#60A5FA'; ctx.shadowBlur=20;
      ctx.globalAlpha=0.45+Math.sin(t*6)*0.15;
      ctx.beginPath(); ctx.arc(p.x+PLAYER_W/2, drawY+PLAYER_H/2, PLAYER_W*0.78, 0, Math.PI*2);
      ctx.fillStyle='#93C5FD'; ctx.fill();
      ctx.restore();
    }

    // invincibility flash
    if (p.inv>0 && Math.floor(p.inv*7)%2===0) ctx.globalAlpha=0.35;

    // cycle 8 run frames at ~12 fps; freeze on frame 1 while airborne
    const frameIdx = p.onGround ? Math.floor(runT.current * 12) % 8 + 1 : 1;
    const chSp = sprites.current[`child_f${frameIdx}`];
    if (chSp?.complete && chSp.naturalWidth>0) { ctx.drawImage(chSp,p.x,drawY,PLAYER_W,PLAYER_H); }
    else {
      ctx.fillStyle='#F97316';
      ctx.beginPath(); ctx.roundRect(p.x,drawY,PLAYER_W,PLAYER_H,8); ctx.fill();
    }
    ctx.globalAlpha=1;

    // particles
    ptcls.current.forEach(pt => {
      ctx.save(); ctx.globalAlpha=pt.alpha;
      ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.r,0,Math.PI*2);
      ctx.fillStyle=pt.color; ctx.fill();
      ctx.restore();
    });

    // distance milestone rings
    const nextMark = Math.ceil(distM.current / 200) * 200;
    const tillNext = nextMark - distM.current;
    if (tillNext < 30) {
      const prog = 1 - tillNext/30;
      ctx.save();
      ctx.globalAlpha = prog * 0.7;
      ctx.font=`bold ${Math.round(16*prog)}px sans-serif`;
      ctx.fillStyle='#FCD34D'; ctx.textAlign='center';
      ctx.fillText(`${nextMark}m!`, CW/2, CH/2 - 60*prog);
      ctx.restore();
    }

    // overlays
    if (phase.current === 'over') {
      ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,CW,CH);
      ctx.fillStyle='#F87171'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center';
      ctx.fillText('GAME OVER', CW/2, CH/2-18);
      ctx.fillStyle='white'; ctx.font='20px sans-serif';
      ctx.fillText(`${Math.round(distM.current)}m run`, CW/2, CH/2+20);
    }
    if (phase.current === 'win') {
      ctx.fillStyle='rgba(0,20,60,0.72)'; ctx.fillRect(0,0,CW,CH);
      ctx.fillStyle='#FCD34D'; ctx.font='bold 30px sans-serif'; ctx.textAlign='center';
      ctx.fillText('FUTURE SECURED!', CW/2, CH/2-18);
      ctx.fillStyle='white'; ctx.font='18px sans-serif';
      ctx.fillText(`${coinsGot.current} savings collected 🎉`, CW/2, CH/2+20);
    }
  }

  // input
  const handleJump = useCallback(() => {
    if (!showHTP && phase.current==='playing') doJump();
  }, [showHTP]);

  useEffect(() => {
    const onKey=(e:KeyboardEvent)=>{ if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();handleJump();} };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  }, [handleJump]);

  const mutRef=useRef(false);
  function toggleMute() {
    mutRef.current=!mutRef.current; setMuted(mutRef.current); setAudioMuted(mutRef.current);
  }

  function handleStart() { setShowHTP(false); startGame(); }

  return (
    <div ref={containerRef} className="relative flex h-full w-full items-center justify-center bg-[#0f172a] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CW} height={CH}
        className="touch-none"
        onPointerDown={handleJump}
      />

      {/* HUD */}
      {!showHTP && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-2 pb-1"
          style={{ background:'rgba(0,0,0,0.35)', backdropFilter:'blur(4px)' }}>
          <div className="flex items-center gap-0.5">
            {Array.from({length:3}).map((_,i)=>(
              <span key={i} className="text-base" style={{opacity:i<hud.lives?1:0.2}}>❤️</span>
            ))}
          </div>
          <div className="text-center">
            <div className="text-[0.6rem] font-bold uppercase text-white/50">Distance</div>
            <div className="text-[0.88rem] font-extrabold text-white">{hud.dist}m</div>
          </div>
          <div className="text-center">
            <div className="text-[0.6rem] font-bold uppercase text-yellow-300">Savings</div>
            <div className="text-[0.88rem] font-extrabold text-yellow-300">{hud.coins}</div>
          </div>
          <button onClick={toggleMute} className="pointer-events-auto rounded-full bg-white/10 px-2 py-0.5 text-[0.68rem] text-white">
            {muted?'🔇':'🔊'}
          </button>
        </div>
      )}

      {/* Shield bar */}
      {!showHTP && hud.shield > 0 && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4">
          <div className="text-[0.58rem] font-bold text-center text-blue-300 mb-0.5">🛡 Parent Shield Active</div>
          <div className="h-1.5 w-full rounded-full bg-white/20">
            <div className="h-1.5 rounded-full bg-blue-400 transition-all"
              style={{width:`${Math.min(100,(hud.shield/SHIELD_DUR)*100)}%`}} />
          </div>
        </div>
      )}

      {showHTP && <HowToPlayPopup onStart={handleStart} />}
    </div>
  );
};

export default GameScreen;
