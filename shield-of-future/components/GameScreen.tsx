
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Vector, GameObject } from '../types';

interface GameScreenProps {
  onFinish: (score: number) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Game logic refs
  const risksRef = useRef<GameObject[]>([]);
  const shieldsRef = useRef<GameObject[]>([]);
  const slingshotPos = useRef<Vector>({ x: 0, y: 0 });
  const dragPos = useRef<Vector | null>(null);
  const nextId = useRef(0);

  const RISKS_LABELS = ['Home Loan', 'Education', 'Monthly Exp', 'Debt', 'Healthcare'];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onFinish, score]);

  const spawnRisk = useCallback((width: number) => {
    const label = RISKS_LABELS[Math.floor(Math.random() * RISKS_LABELS.length)];
    risksRef.current.push({
      id: nextId.current++,
      pos: { x: Math.random() * (width - 60) + 30, y: -50 },
      vel: { x: (Math.random() - 0.5) * 1, y: 1.5 + Math.random() * 2 },
      radius: 40,
      label,
      type: 'RISK'
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        slingshotPos.current = { x: canvas.width / 2, y: canvas.height - 100 };
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const update = () => {
      // Spawn risks
      if (Math.random() < 0.03 && risksRef.current.length < 5) {
        spawnRisk(canvas.width);
      }

      // Update risks
      risksRef.current = risksRef.current.filter((r) => {
        r.pos.x += r.vel.x;
        r.pos.y += r.vel.y;
        return r.pos.y < canvas.height + 50;
      });

      // Update shields
      shieldsRef.current = shieldsRef.current.filter((s) => {
        s.pos.x += s.vel.x;
        s.pos.y += s.vel.y;
        return (
          s.pos.y > -50 &&
          s.pos.x > -50 &&
          s.pos.x < canvas.width + 50
        );
      });

      // Collision Detection
      shieldsRef.current.forEach((s) => {
        risksRef.current = risksRef.current.filter((r) => {
          const dist = Math.sqrt(
            Math.pow(s.pos.x - r.pos.x, 2) + Math.pow(s.pos.y - r.pos.y, 2)
          );
          if (dist < s.radius + r.radius) {
            setScore((prev) => prev + 100000); // 100k coverage per risk hit
            return false;
          }
          return true;
        });
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Gradients
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#f1f5f9');
      bgGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Slingshot Base
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#475569';
      ctx.moveTo(slingshotPos.current.x - 20, slingshotPos.current.y + 40);
      ctx.lineTo(slingshotPos.current.x, slingshotPos.current.y);
      ctx.lineTo(slingshotPos.current.x + 20, slingshotPos.current.y + 40);
      ctx.stroke();

      // Drag line
      if (dragPos.current) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#3b82f6';
        ctx.moveTo(slingshotPos.current.x, slingshotPos.current.y);
        ctx.lineTo(dragPos.current.x, dragPos.current.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Projectile preview
        ctx.beginPath();
        ctx.arc(dragPos.current.x, dragPos.current.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }

      // Draw Risks
      risksRef.current.forEach((r) => {
        ctx.beginPath();
        ctx.arc(r.pos.x, r.pos.y, r.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(r.label || '', r.pos.x, r.pos.y + 4);
      });

      // Draw Shields
      shieldsRef.current.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.pos.x, s.pos.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD', s.pos.x, s.pos.y + 5);
      });
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [spawnRisk]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragPos.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragPos.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragPos.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleEnd = () => {
    if (!dragPos.current) return;
    
    // Calculate vector from dragPos back to slingshotPos
    const dx = slingshotPos.current.x - dragPos.current.x;
    const dy = slingshotPos.current.y - dragPos.current.y;
    const speedMultiplier = 0.15;

    shieldsRef.current.push({
      id: nextId.current++,
      pos: { ...slingshotPos.current },
      vel: { x: dx * speedMultiplier, y: dy * speedMultiplier },
      radius: 20,
      type: 'SHIELD'
    });

    dragPos.current = null;
  };

  return (
    <div ref={containerRef} className="flex-1 relative bg-slate-100 touch-none">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Coverage: </span>
          <span className="text-sm font-bold text-blue-600">${score.toLocaleString()}</span>
        </div>
        <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Time: </span>
          <span className={`text-sm font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>{timeLeft}s</span>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="w-full h-full"
      />

      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-40">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Pull back to launch protection
        </p>
      </div>
    </div>
  );
};

export default GameScreen;
