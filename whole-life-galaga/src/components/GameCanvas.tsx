import { useEffect, useRef, useState } from "react";
import { GameResult, GameStats } from "../types";
import { CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_COLORS, ENEMY_ICONS, POWERUP_COLORS, POWERUP_ICONS, INITIAL_COVERAGE } from "../constants";
import { audioEngine } from "../audio";
import { MuteToggle } from "./MuteToggle";

interface GameCanvasProps {
  onFinished: (result: GameResult) => void;
}

export function GameCanvas({ onFinished }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  
  const playerXRef = useRef(CANVAS_WIDTH / 2);
  const bulletsRef = useRef<any[]>([]);
  const enemiesRef = useRef<any[]>([]);
  const powerupsRef = useRef<any[]>([]);
  const nextIdRef = useRef(1);
  
  const statsRef = useRef<GameStats>({
    score: 0,
    coveragePercent: INITIAL_COVERAGE,
    savingsBuilt: 0,
    enemiesDestroyed: 0,
    powerUpsCollected: 0,
    lastShot: 0,
    lastEnemySpawn: 0,
    lastPowerupSpawn: 0
  });

  const [hud, setHud] = useState<GameStats>(statsRef.current);
  const [timeLeft, setTimeLeft] = useState(CONFIG.gameplay.sessionCapSeconds);

  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color = "#ffffff", weight = 700) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
  };

  const spawnEnemy = (elapsed: number) => {
    const wave = Math.floor(elapsed / 20) + 1;
    const types = ["risk", "risk", "health", "health", "death", "emergency"];
    const kind = types[Math.floor(Math.random() * types.length)];
    
    const formation = [
      { x: CANVAS_WIDTH * 0.25, y: -50 },
      { x: CANVAS_WIDTH * 0.5, y: -50 },
      { x: CANVAS_WIDTH * 0.75, y: -50 },
      { x: CANVAS_WIDTH * 0.125, y: -100 },
      { x: CANVAS_WIDTH * 0.875, y: -100 }
    ];
    
    const pos = formation[Math.floor(Math.random() * formation.length)];
    
    enemiesRef.current.push({
      id: nextIdRef.current++,
      x: pos.x,
      y: pos.y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.6 + wave * 0.1 + Math.random() * 0.4,
      kind,
      size: 36
    });
  };

  const spawnPowerup = () => {
    const kind = Math.random() < 0.5 ? "savings" : "coverage";
    powerupsRef.current.push({
      id: nextIdRef.current++,
      x: 40 + Math.random() * (CANVAS_WIDTH - 80),
      y: -30,
      vx: 0,
      vy: 1.2,
      kind,
      size: 28
    });
  };

  const finish = (gameTime: number) => {
    const final = statsRef.current;
    let score = Math.floor(final.score);
    
    if (CONFIG.scoring.timeBonus && gameTime < CONFIG.scoring.timeBonusThresholdSeconds) {
      score += Math.floor((CONFIG.scoring.timeBonusThresholdSeconds - gameTime) / 10) * 5;
    }
    
    audioEngine.playSound("gameover");
    audioEngine.stopMusic();
    
    onFinished({
      score,
      coveragePercent: Math.min(100, final.coveragePercent),
      savingsBuilt: Math.floor(final.savingsBuilt),
      enemiesDestroyed: final.enemiesDestroyed,
      powerUpsCollected: final.powerUpsCollected,
      timeElapsed: Math.floor(gameTime)
    });
  };

  useEffect(() => {
    audioEngine.init();
    audioEngine.resume();
    audioEngine.startMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      const remaining = Math.max(0, Math.ceil(CONFIG.gameplay.sessionCapSeconds - elapsed));
      setTimeLeft(remaining);

      if (time - statsRef.current.lastEnemySpawn > Math.max(600, 1400 - elapsed * 8)) {
        spawnEnemy(elapsed);
        statsRef.current.lastEnemySpawn = time;
      }

      if (time - statsRef.current.lastPowerupSpawn > 8000 && Math.random() < 0.02) {
        spawnPowerup();
        statsRef.current.lastPowerupSpawn = time;
      }

      if (time - statsRef.current.lastShot > 180) {
        bulletsRef.current.push({
          id: nextIdRef.current++,
          x: playerXRef.current,
          y: CANVAS_HEIGHT - 120,
          vx: 0,
          vy: -8,
          kind: "risk",
          size: 6
        });
        statsRef.current.lastShot = time;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, "#0d1b2a");
      bgGrad.addColorStop(0.5, "#1b263b");
      bgGrad.addColorStop(1, "#0d1b2a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 12; i++) {
        const starY = (i * 60 + elapsed * 20) % (CANVAS_HEIGHT + 40) - 20;
        const starX = 30 + (i * 73) % (CANVAS_WIDTH - 60);
        ctx.fillStyle = i % 3 === 0 ? "#f4d03f" : "#ffffff";
        ctx.fillRect(starX, starY, 2, 2);
      }
      ctx.globalAlpha = 1;

      for (const bullet of bulletsRef.current) {
        bullet.y += bullet.vy;
        ctx.fillStyle = "#f4d03f";
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const enemy of enemiesRef.current) {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        
        if (enemy.x < 30 || enemy.x > CANVAS_WIDTH - 30) enemy.vx *= -1;

        ctx.fillStyle = ENEMY_COLORS[enemy.kind] || "#e74c3c";
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.size / 2);
        ctx.lineTo(enemy.x + enemy.size / 2, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + enemy.size / 2);
        ctx.lineTo(enemy.x - enemy.size / 2, enemy.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        drawText(ctx, ENEMY_ICONS[enemy.kind] || "⚠", enemy.x, enemy.y + 4, 14, "#ffffff", 700);
      }

      for (const pup of powerupsRef.current) {
        pup.y += pup.vy;
        
        const isSavings = pup.kind === "savings";
        ctx.fillStyle = isSavings ? POWERUP_COLORS.savings : POWERUP_COLORS.coverage;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(pup.x, pup.y, pup.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        drawText(ctx, isSavings ? POWERUP_ICONS.savings : POWERUP_ICONS.coverage, pup.x, pup.y + 4, 14, "#ffffff", 700);
      }

      const px = playerXRef.current;
      const py = CANVAS_HEIGHT - 80;

      ctx.fillStyle = "rgba(0, 61, 166, 0.3)";
      ctx.beginPath();
      ctx.ellipse(px, py + 30, 50, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = CONFIG.ui.primaryColor;
      ctx.strokeStyle = CONFIG.ui.accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py - 35);
      ctx.lineTo(px - 25, py + 20);
      ctx.lineTo(px + 25, py + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 10px 'Plus Jakarta Sans', system-ui";
      ctx.textAlign = "center";
      ctx.fillText("LIFE", px, py + 5);

      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const bullet = bulletsRef.current[i];
        if (bullet.y < -10) {
          bulletsRef.current.splice(i, 1);
          continue;
        }

        for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
          const enemy = enemiesRef.current[j];
          const dist = Math.sqrt(Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2));
          if (dist < enemy.size / 2 + 4) {
            bulletsRef.current.splice(i, 1);
            enemiesRef.current.splice(j, 1);
            
            statsRef.current.enemiesDestroyed += 1;
            statsRef.current.score += CONFIG.scoring.pointsPerHit;
            audioEngine.playSound("score");
            
            const powerup = Math.random();
            if (powerup < 0.15) {
              statsRef.current.powerUpsCollected += 1;
              if (powerup < 0.075) {
                statsRef.current.savingsBuilt += Math.floor(Math.random() * 500 + 100);
              } else {
                statsRef.current.coveragePercent = Math.min(100, statsRef.current.coveragePercent + 5);
              }
            }
            setHud({ ...statsRef.current });
            break;
          }
        }
      }

      for (let i = powerupsRef.current.length - 1; i >= 0; i--) {
        const pup = powerupsRef.current[i];
        if (pup.y > CANVAS_HEIGHT + 30) {
          powerupsRef.current.splice(i, 1);
          continue;
        }

        const dist = Math.sqrt(Math.pow(pup.x - px, 2) + Math.pow(pup.y - py, 2));
        if (dist < 40) {
          powerupsRef.current.splice(i, 1);
          statsRef.current.powerUpsCollected += 1;
          
          if (pup.kind === "savings") {
            statsRef.current.savingsBuilt += Math.floor(Math.random() * 800 + 200);
          } else {
            statsRef.current.coveragePercent = Math.min(100, statsRef.current.coveragePercent + 8);
          }
          statsRef.current.score += 25;
          audioEngine.playSound("powerup");
          setHud({ ...statsRef.current });
        }
      }

      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const enemy = enemiesRef.current[i];
        if (enemy.y > CANVAS_HEIGHT + 30) {
          enemiesRef.current.splice(i, 1);
          continue;
        }

        const dist = Math.sqrt(Math.pow(enemy.x - px, 2) + Math.pow(enemy.y - py, 2));
        if (dist < 35) {
          enemiesRef.current.splice(i, 1);
          statsRef.current.score = Math.max(0, statsRef.current.score - CONFIG.scoring.penaltyPerMiss);
          statsRef.current.coveragePercent = Math.max(0, statsRef.current.coveragePercent - 3);
          audioEngine.playSound("hit");
          setHud({ ...statsRef.current });
        }
      }

      if (elapsed >= CONFIG.gameplay.sessionCapSeconds) {
        finish(elapsed);
        return;
      }

      requestRef.current = window.requestAnimationFrame(loop);
    };

    requestRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
    };
  }, [onFinished]);

  const moveLeft = () => { playerXRef.current = Math.max(40, playerXRef.current - 30); };
  const moveRight = () => { playerXRef.current = Math.min(CANVAS_WIDTH - 40, playerXRef.current + 30); };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    playerXRef.current = Math.max(40, Math.min(CANVAS_WIDTH - 40, x));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
  };

  return (
    <div className="game-screen">
      <div className="game-hud">
        <div className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value">{Math.floor(hud.score)}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Coverage</span>
          <span className="hud-value">{hud.coveragePercent}%</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Savings</span>
          <span className="hud-value">₹{Math.floor(hud.savingsBuilt)}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Time</span>
          <span className="hud-value">{timeLeft}s</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="game-canvas"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      />
      <div className="game-controls">
        <button className="control-btn" onClick={moveLeft}>◀</button>
        <MuteToggle />
        <button className="control-btn" onClick={moveRight}>▶</button>
      </div>
    </div>
  );
}