import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  CORE_POSITION,
  ENEMY_DEFINITIONS,
  GAME_HEIGHT,
  GAME_WIDTH,
  PATH_POINTS,
  TOWER_DEFINITIONS,
  type GameSnapshot,
  type Point,
  type TowerType,
} from '../../shared/game-data';

interface GameCanvasProps {
  snapshot: GameSnapshot;
  selectedTowerType: TowerType;
  onPadClick: (padId: string) => void;
}

const getCanvasCoordinates = (
  event: MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): Point => {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = GAME_WIDTH / bounds.width;
  const scaleY = GAME_HEIGHT / bounds.height;

  return {
    x: (event.clientX - bounds.left) * scaleX,
    y: (event.clientY - bounds.top) * scaleY,
  };
};

export const GameCanvas = ({
  snapshot,
  selectedTowerType,
  onPadClick,
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPadId, setHoveredPadId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const backgroundGradient = context.createLinearGradient(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
    );
    backgroundGradient.addColorStop(0, '#08131e');
    backgroundGradient.addColorStop(0.55, '#0f2a33');
    backgroundGradient.addColorStop(1, '#1d3d4b');
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    context.strokeStyle = 'rgba(244, 206, 91, 0.08)';
    context.lineWidth = 1;
    for (let x = 0; x <= GAME_WIDTH; x += 48) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, GAME_HEIGHT);
      context.stroke();
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 48) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(GAME_WIDTH, y);
      context.stroke();
    }

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = 'rgba(255, 233, 165, 0.28)';
    context.lineWidth = 28;
    context.beginPath();
    context.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    PATH_POINTS.slice(1).forEach((point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();

    context.strokeStyle = 'rgba(248, 211, 109, 0.9)';
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    PATH_POINTS.slice(1).forEach((point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();

    const coreGradient = context.createRadialGradient(
      CORE_POSITION.x,
      CORE_POSITION.y,
      8,
      CORE_POSITION.x,
      CORE_POSITION.y,
      80,
    );
    coreGradient.addColorStop(0, '#fef3c7');
    coreGradient.addColorStop(1, 'rgba(245, 158, 11, 0.18)');
    context.fillStyle = coreGradient;
    context.beginPath();
    context.arc(CORE_POSITION.x, CORE_POSITION.y, 74, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#f59e0b';
    context.beginPath();
    context.arc(CORE_POSITION.x, CORE_POSITION.y, 46, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#1b1d23';
    context.font = '700 14px Avenir Next, Segoe UI, sans-serif';
    context.textAlign = 'center';
    context.fillText('CORE', CORE_POSITION.x, CORE_POSITION.y + 5);

    const selectedTower = TOWER_DEFINITIONS[selectedTowerType];

    snapshot.buildPads.forEach((pad) => {
      const isHovered = hoveredPadId === pad.id;
      const isOccupied = Boolean(pad.occupiedTowerId);

      context.fillStyle = isOccupied
        ? 'rgba(226, 232, 240, 0.28)'
        : isHovered
          ? selectedTower.color
          : 'rgba(125, 211, 252, 0.16)';
      context.strokeStyle = isOccupied
        ? 'rgba(226, 232, 240, 0.35)'
        : 'rgba(255, 255, 255, 0.2)';
      context.lineWidth = isHovered ? 4 : 2;
      context.beginPath();
      context.arc(pad.position.x, pad.position.y, 18, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });

    snapshot.beams.forEach((beam) => {
      context.strokeStyle = beam.color;
      context.lineWidth = 4;
      context.globalAlpha = Math.max(0.2, beam.ttl / 0.12);
      context.beginPath();
      context.moveTo(beam.from.x, beam.from.y);
      context.lineTo(beam.to.x, beam.to.y);
      context.stroke();
      context.globalAlpha = 1;
    });

    snapshot.towers.forEach((tower) => {
      const definition = TOWER_DEFINITIONS[tower.type];

      context.fillStyle = definition.color;
      context.beginPath();
      context.arc(tower.position.x, tower.position.y, 16, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle =
        tower.disabledUntil > snapshot.clock
          ? 'rgba(248, 113, 113, 0.85)'
          : 'rgba(255, 255, 255, 0.8)';
      context.lineWidth = 3;
      context.stroke();

      context.fillStyle = '#0f172a';
      context.font = '700 11px Avenir Next, Segoe UI, sans-serif';
      context.textAlign = 'center';
      context.fillText(definition.shortLabel, tower.position.x, tower.position.y + 4);
    });

    snapshot.enemies.forEach((enemy) => {
      const definition = ENEMY_DEFINITIONS[enemy.type];
      context.fillStyle = definition.color;
      context.beginPath();
      context.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = 'rgba(15, 23, 42, 0.85)';
      context.fillRect(enemy.position.x - 20, enemy.position.y - 26, 40, 5);
      context.fillStyle = '#22c55e';
      context.fillRect(
        enemy.position.x - 20,
        enemy.position.y - 26,
        (enemy.health / enemy.maxHealth) * 40,
        5,
      );
    });

    context.fillStyle = 'rgba(255, 255, 255, 0.76)';
    context.font = '600 15px Avenir Next, Segoe UI, sans-serif';
    context.textAlign = 'left';
    context.fillText(
      'Click a deployment pad to place the selected tower.',
      20,
      28,
    );
  }, [hoveredPadId, selectedTowerType, snapshot]);

  return (
    <canvas
      ref={canvasRef}
      className="battle-canvas"
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      onMouseLeave={() => setHoveredPadId(null)}
      onMouseMove={(event) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const point = getCanvasCoordinates(event, canvas);
        const hoveredPad = snapshot.buildPads.find(
          (pad) =>
            Math.hypot(pad.position.x - point.x, pad.position.y - point.y) <= 22,
        );
        setHoveredPadId(hoveredPad?.id ?? null);
      }}
      onClick={(event) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const point = getCanvasCoordinates(event, canvas);
        const selectedPad = snapshot.buildPads.find(
          (pad) =>
            Math.hypot(pad.position.x - point.x, pad.position.y - point.y) <= 22,
        );

        if (selectedPad) {
          onPadClick(selectedPad.id);
        }
      }}
    />
  );
};
