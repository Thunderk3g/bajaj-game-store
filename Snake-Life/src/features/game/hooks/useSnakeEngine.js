import { useRef, useEffect, useCallback, useState } from 'react';
import { useGame, GAME_STATUS } from '../context/GameContext';
import {
    GRID_SIZE,
    INITIAL_SPEED,
    MIN_SPEED,
    GAME_DURATION,
    SPEED_INCREMENT_TIME,
    SPEED_DECREMENT_TIME_VAL,
    SPEED_DECREMENT_PELLET_VAL,
    INITIAL_SNAKE,
    DIRECTIONS
} from '../constants/constants';
import foodSound from '../../../assets/sound/music_food.mp3';
import gameOverSound from '../../../assets/sound/music_gameover.mp3';

export const useSnakeEngine = () => {
    const {
        status,
        setStatus,
        incrementScore,
        triggerReflection,
        score,
        sessionCount,
        showToast
    } = useGame();

    // Engine state using refs for performance
    const snakeRef = useRef(JSON.parse(JSON.stringify(INITIAL_SNAKE)));
    const previousSnakeRef = useRef(JSON.parse(JSON.stringify(INITIAL_SNAKE)));
    const directionRef = useRef(DIRECTIONS.UP);
    const nextDirectionRef = useRef(DIRECTIONS.UP);
    const pelletRef = useRef({ x: 5, y: 5 });
    const speedRef = useRef(INITIAL_SPEED);
    const growthPendingRef = useRef(0);
    const lastMoveTimeRef = useRef(0);
    const lastSpeedUpdateTimeRef = useRef(0);
    const timerRef = useRef(GAME_DURATION);
    const gameLoopIdRef = useRef(null);
    const triggerTimeoutRef = useRef(null);

    // Sound effects
    const foodAudioRef = useRef(null);
    const gameOverAudioRef = useRef(null);

    useEffect(() => {
        const setupAudio = (src, ref) => {
            const audio = new Audio(`${src}?v=${Date.now()}`);
            audio.preload = 'auto';
            ref.current = audio;
        };

        setupAudio(foodSound, foodAudioRef);
        setupAudio(gameOverSound, gameOverAudioRef);
    }, []);

    // Stats for UI
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [tick, setTick] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const generatePellet = useCallback(() => {
        let newPellet;
        const isOccupied = (p) => snakeRef.current.some(s => s.x === p.x && s.y === p.y);

        do {
            newPellet = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (isOccupied(newPellet));

        pelletRef.current = newPellet;
    }, []);

    const resetEngine = useCallback(() => {
        if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
        snakeRef.current = JSON.parse(JSON.stringify(INITIAL_SNAKE));
        previousSnakeRef.current = JSON.parse(JSON.stringify(INITIAL_SNAKE));
        directionRef.current = DIRECTIONS.UP;
        nextDirectionRef.current = DIRECTIONS.UP;
        speedRef.current = INITIAL_SPEED;
        timerRef.current = GAME_DURATION;
        growthPendingRef.current = 0;
        setTimeLeft(GAME_DURATION);
        lastMoveTimeRef.current = 0;
        lastSpeedUpdateTimeRef.current = performance.now();
        setTick(0);
        generatePellet();
    }, [generatePellet]);

    const moveSnake = useCallback(() => {
        previousSnakeRef.current = [...snakeRef.current];
        directionRef.current = nextDirectionRef.current;
        const head = snakeRef.current[0];
        const newHead = {
            x: head.x + directionRef.current.x,
            y: head.y + directionRef.current.y
        };

        // Collision Detection
        let hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
        let hitSelf = snakeRef.current.some(s => s.x === newHead.x && s.y === newHead.y);

        if (hitWall || hitSelf) {
            // Play game over sound
            if (gameOverAudioRef.current) {
                gameOverAudioRef.current.currentTime = 0;
                gameOverAudioRef.current.play().catch(() => { });
            }
            if (handleGameOverRef.current) handleGameOverRef.current();
            return;
        }

        const newSnake = [newHead, ...snakeRef.current];

        // Check Pellet
        if (newHead.x === pelletRef.current.x && newHead.y === pelletRef.current.y) {
            // Play food eating sound
            if (foodAudioRef.current) {
                foodAudioRef.current.currentTime = 0;
                foodAudioRef.current.play().catch(() => { });
            }
            const currentMilestones = score + 1;

            // Growth: Milestones 1–5 → +2 segments, 6+ → +3 segments
            const additionalSegments = currentMilestones <= 5 ? 1 : 2;
            growthPendingRef.current += additionalSegments;

            handlePelletEatenRef.current(currentMilestones);
            generatePellet();
        } else {
            if (growthPendingRef.current > 0) {
                growthPendingRef.current -= 1;
            } else {
                newSnake.pop();
            }
        }

        snakeRef.current = newSnake;
        setTick(t => t + 1);
    }, [score, generatePellet]);

    const handleGameOverRef = useRef(null);
    handleGameOverRef.current = useCallback(() => {
        setStatus(GAME_STATUS.GAMEOVER);
    }, [setStatus]);

    const handlePelletEatenRef = useRef(null);
    handlePelletEatenRef.current = (milestone) => {
        incrementScore();

        // Speed reduction: -6ms per pellet
        speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_DECREMENT_PELLET_VAL);

        if (milestone % 5 === 0) {
            triggerReflection("Your family's dependency just grew. Is your protection growing too?", 2500);
        }

        // Rule 1: Every Pellet Consumed (except 3rd)
        // Rule 2: Every 3rd Pellet
        if (milestone % 3 === 0) {
            showToast("More milestones. More responsibility.", 2000);
        } else {
            showToast("Life just grew.", 2000);
        }
    };

    const gameLoop = useCallback((timestamp) => {
        if (status !== GAME_STATUS.PLAYING) {
            lastMoveTimeRef.current = 0; // Reset so next resume doesn't jump
            return;
        }

        if (isPaused) {
            lastMoveTimeRef.current = timestamp;
            lastSpeedUpdateTimeRef.current = timestamp;
            gameLoopIdRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        if (!lastMoveTimeRef.current) {
            lastMoveTimeRef.current = timestamp;
            lastSpeedUpdateTimeRef.current = timestamp;
            gameLoopIdRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const delta = timestamp - lastMoveTimeRef.current;

        // Speed escalation every 3s
        if (timestamp - lastSpeedUpdateTimeRef.current > SPEED_INCREMENT_TIME) {
            speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_DECREMENT_TIME_VAL);
            lastSpeedUpdateTimeRef.current = timestamp;
        }

        // Move Logic
        if (delta >= speedRef.current) {
            lastMoveTimeRef.current = timestamp;
            moveSnake();

            // Update Timer React State
            timerRef.current -= delta / 1000;
            if (timerRef.current <= 0) {
                if (handleGameOverRef.current) handleGameOverRef.current();
            } else {
                setTimeLeft(Math.ceil(timerRef.current));
            }
        }

        gameLoopIdRef.current = requestAnimationFrame(gameLoop);
    }, [status, moveSnake, isPaused]);

    useEffect(() => {
        if (status === GAME_STATUS.PLAYING) {
            gameLoopIdRef.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(gameLoopIdRef.current);
        }
        return () => cancelAnimationFrame(gameLoopIdRef.current);
    }, [status, gameLoop]);

    useEffect(() => {
        const { UP, DOWN, LEFT, RIGHT } = DIRECTIONS;
        const handleKeyDown = (e) => {
            const currentDir = directionRef.current;
            switch (e.key) {
                case 'ArrowUp':
                    if (currentDir.y === 0) nextDirectionRef.current = UP;
                    break;
                case 'ArrowDown':
                    if (currentDir.y === 0) nextDirectionRef.current = DOWN;
                    break;
                case 'ArrowLeft':
                    if (currentDir.x === 0) nextDirectionRef.current = LEFT;
                    break;
                case 'ArrowRight':
                    if (currentDir.x === 0) nextDirectionRef.current = RIGHT;
                    break;
            }
        };

        // Swipe Support
        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            // Prevent default scrolling only when touching the game area
            if (e.target.closest && e.target.closest('canvas')) {
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const currentDir = directionRef.current;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 30) {
                    if (dx > 0 && currentDir.x === 0) nextDirectionRef.current = RIGHT;
                    else if (dx < 0 && currentDir.x === 0) nextDirectionRef.current = LEFT;
                }
            } else {
                if (Math.abs(dy) > 30) {
                    if (dy > 0 && currentDir.y === 0) nextDirectionRef.current = DOWN;
                    else if (dy < 0 && currentDir.y === 0) nextDirectionRef.current = UP;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return {
        snake: [...snakeRef.current],
        previousSnake: [...previousSnakeRef.current],
        pellet: pelletRef.current,
        timeLeft,
        speed: speedRef.current,
        lastMoveTime: lastMoveTimeRef.current,
        resetEngine,
        setIsPaused
    };
};
