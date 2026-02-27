/**
 * useBombermanEngine — Main orchestration hook for the Bomberman game.
 * Manages all game state: grid, player, bombs, health, score, phases.
 * All business logic lives here — components are purely presentational.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    GAME_PHASES,
    GAME_DURATION_SECONDS,
    INITIAL_HEALTH,
    BOMB_TIMER_MS,
    BOMB_RADIUS,
    POINTS_PER_RISK,
    HEALTH_BONUS_MULTIPLIER,
    TIME_BONUS_MULTIPLIER,
    CELL_TYPES,
    DIRECTIONS,
    PRAISE_MESSAGES,
} from '../constants/gameConstants.js';
import {
    generateGrid,
    isInBounds,
    getExplosionCells,
    cloneGrid,
    computeFinalScore,
} from '../utils/gridUtils.js';
import { submitToLMS } from '../services/apiClient.js';

const MOVE_COOLDOWN = 120;

export function useBombermanEngine() {
    const [gamePhase, setGamePhase] = useState(GAME_PHASES.LANDING);
    const [grid, setGrid] = useState(() => generateGrid());
    const [playerPos, setPlayerPos] = useState({ row: 1, col: 1 });
    const [health, setHealth] = useState(INITIAL_HEALTH);
    const [score, setScore] = useState(0);
    const [risksDestroyed, setRisksDestroyed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
    const [explosionCells, setExplosionCells] = useState([]);
    const [activePraise, setActivePraise] = useState(null);
    const [floatingScores, setFloatingScores] = useState([]);
    const [entryDetails, setEntryDetails] = useState(null);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [activeBomb, setActiveBomb] = useState(null);

    const gridRef = useRef(grid);
    const playerPosRef = useRef(playerPos);
    const isPlayingRef = useRef(false);
    const timerRef = useRef(null);
    const bombTimerRef = useRef(null);
    const lastMoveRef = useRef(0);
    const leadFiredRef = useRef(false);
    const praiseTimeoutRef = useRef(null);
    const healthRef = useRef(health);
    const floatIdRef = useRef(0);

    gridRef.current = grid;
    playerPosRef.current = playerPos;
    healthRef.current = health;

    useEffect(() => {
        isPlayingRef.current = gamePhase === GAME_PHASES.PLAYING;
    }, [gamePhase]);

    // ── Timer ──────────────────────────────────────────────────────
    useEffect(() => {
        if (gamePhase !== GAME_PHASES.PLAYING) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [gamePhase]);

    // ── Keyboard Controls ──────────────────────────────────────────
    useEffect(() => {
        if (gamePhase !== GAME_PHASES.PLAYING) return;

        const handleKeyDown = (e) => {
            const keyMap = {
                ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
                w: 'UP', W: 'UP', s: 'DOWN', S: 'DOWN',
                a: 'LEFT', A: 'LEFT', d: 'RIGHT', D: 'RIGHT',
            };

            const direction = keyMap[e.key];
            if (direction) {
                e.preventDefault();
                movePlayer(direction);
                return;
            }

            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                placeBomb();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gamePhase]);

    // ── Cleanup ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (bombTimerRef.current) clearTimeout(bombTimerRef.current);
            if (praiseTimeoutRef.current) clearTimeout(praiseTimeoutRef.current);
        };
    }, []);

    // ── Movement ───────────────────────────────────────────────────
    const movePlayer = useCallback((direction) => {
        if (!isPlayingRef.current) return;

        const now = Date.now();
        if (now - lastMoveRef.current < MOVE_COOLDOWN) return;

        const dir = DIRECTIONS[direction];
        if (!dir) return;

        const currentPos = playerPosRef.current;
        const newRow = currentPos.row + dir.row;
        const newCol = currentPos.col + dir.col;

        if (!isInBounds(newRow, newCol)) return;

        const currentGrid = gridRef.current;
        const targetCell = currentGrid[newRow][newCol];

        if (targetCell.type === CELL_TYPES.WALL || targetCell.type === CELL_TYPES.RISK) return;
        if (targetCell.hasBomb) return;

        lastMoveRef.current = now;
        setPlayerPos({ row: newRow, col: newCol });

        if (targetCell.type === CELL_TYPES.EXIT) {
            endGame();
        }
    }, []);

    // ── Bomb System ────────────────────────────────────────────────
    const placeBomb = useCallback(() => {
        if (!isPlayingRef.current) return;
        if (activeBomb) return;

        const pos = playerPosRef.current;
        const currentGrid = gridRef.current;

        if (currentGrid[pos.row][pos.col].hasBomb) return;

        const newGrid = cloneGrid(currentGrid);
        newGrid[pos.row][pos.col].hasBomb = true;
        setGrid(newGrid);
        setActiveBomb({ row: pos.row, col: pos.col });

        bombTimerRef.current = setTimeout(() => {
            detonateBomb(pos.row, pos.col);
        }, BOMB_TIMER_MS);
    }, [activeBomb]);

    const detonateBomb = useCallback((bombRow, bombCol) => {
        const currentGrid = gridRef.current;
        if (!currentGrid) return;

        const affected = getExplosionCells(currentGrid, bombRow, bombCol, BOMB_RADIUS);
        setExplosionCells(affected);

        const newGrid = cloneGrid(currentGrid);
        const destroyedRisks = [];

        newGrid[bombRow][bombCol].hasBomb = false;

        for (const { row, col } of affected) {
            newGrid[row][col].isExploding = true;

            if (newGrid[row][col].type === CELL_TYPES.RISK) {
                if (newGrid[row][col].riskData) {
                    destroyedRisks.push(newGrid[row][col].riskData.label);
                }
                newGrid[row][col].type = CELL_TYPES.FLOOR;
                newGrid[row][col].riskData = null;
            }
        }

        setGrid(newGrid);

        const currentPlayerPos = playerPosRef.current;
        const playerHit = affected.some(
            c => c.row === currentPlayerPos.row && c.col === currentPlayerPos.col
        );

        if (playerHit) {
            setHealth(prev => {
                const newHealth = prev - 1;
                if (newHealth <= 0) {
                    setTimeout(() => endGame(), 300);
                }
                return Math.max(0, newHealth);
            });
            setShakeScreen(true);
            setTimeout(() => setShakeScreen(false), 300);
        }

        if (destroyedRisks.length > 0) {
            const totalDestroyed = destroyedRisks.length;
            setRisksDestroyed(prev => prev + totalDestroyed);
            setScore(prev => prev + totalDestroyed * POINTS_PER_RISK);
            addFloatingScore(`+${totalDestroyed * POINTS_PER_RISK}`, bombRow, bombCol);

            const praiseMsg = totalDestroyed === 1
                ? `${destroyedRisks[0]} Mitigated!`
                : `${totalDestroyed} Risks Mitigated!`;
            showPraise(praiseMsg);
        }

        setTimeout(() => {
            const cleanGrid = cloneGrid(gridRef.current);
            for (let r = 0; r < cleanGrid.length; r++) {
                for (let c = 0; c < cleanGrid[r].length; c++) {
                    cleanGrid[r][c].isExploding = false;
                }
            }
            setGrid(cleanGrid);
            setExplosionCells([]);
            setActiveBomb(null);
        }, 500);
    }, []);

    // ── Floating Score ─────────────────────────────────────────────
    const addFloatingScore = useCallback((value, row, col) => {
        const id = `fs-${++floatIdRef.current}`;
        setFloatingScores(prev => [...prev, { id, value, row, col }]);
        setTimeout(() => {
            setFloatingScores(prev => prev.filter(f => f.id !== id));
        }, 800);
    }, []);

    // ── Praise ─────────────────────────────────────────────────────
    const showPraise = useCallback((customMsg) => {
        const msg = customMsg || PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
        setActivePraise(msg);

        if (praiseTimeoutRef.current) clearTimeout(praiseTimeoutRef.current);
        praiseTimeoutRef.current = setTimeout(() => {
            setActivePraise(null);
        }, 1200);
    }, []);

    // ── Game Flow ──────────────────────────────────────────────────
    const handleEntrySubmit = useCallback(async (name, mobile) => {
        setEntryDetails({ name, mobile });
        leadFiredRef.current = false;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        await submitToLMS({
            name: name.trim(),
            mobile_no: mobile,
            param4: dateStr,
            param19: '09:00 AM',
            summary_dtls: 'Life Shield Bomber Lead',
            p_data_source: 'LIFE_SHIELD_BOMBER_LEAD',
        });

        setGamePhase(GAME_PHASES.HOW_TO_PLAY);
    }, []);

    const startGame = useCallback(() => {
        const newGrid = generateGrid();
        setGrid(newGrid);
        setPlayerPos({ row: 1, col: 1 });
        setHealth(INITIAL_HEALTH);
        setScore(0);
        setRisksDestroyed(0);
        setTimeLeft(GAME_DURATION_SECONDS);
        setExplosionCells([]);
        setActivePraise(null);
        setFloatingScores([]);
        setShakeScreen(false);
        setActiveBomb(null);

        if (bombTimerRef.current) {
            clearTimeout(bombTimerRef.current);
            bombTimerRef.current = null;
        }

        setGamePhase(GAME_PHASES.PLAYING);
    }, []);

    const endGame = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (bombTimerRef.current) {
            clearTimeout(bombTimerRef.current);
            bombTimerRef.current = null;
        }
        setGamePhase(GAME_PHASES.FINISHED);

        setTimeout(() => {
            setGamePhase(GAME_PHASES.RESULT);
        }, 1500);
    }, []);

    const exitGame = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (bombTimerRef.current) {
            clearTimeout(bombTimerRef.current);
            bombTimerRef.current = null;
        }

        if (!leadFiredRef.current && entryDetails) {
            leadFiredRef.current = true;
            const finalScoreVal = computeFinalScore(risksDestroyed, health, timeLeft);
            submitToLMS({
                name: entryDetails.name,
                mobile_no: entryDetails.mobile,
                score: finalScoreVal,
                summary_dtls: `Life Shield Bomber - Early Exit - Score: ${finalScoreVal}/100`,
                p_data_source: 'LIFE_SHIELD_BOMBER_LEAD',
            });
        }

        setGamePhase(GAME_PHASES.EXITED);

        setTimeout(() => {
            setGamePhase(GAME_PHASES.RESULT);
        }, 800);
    }, [entryDetails, risksDestroyed, health, timeLeft]);

    const restartGame = useCallback(() => {
        leadFiredRef.current = false;
        setGamePhase(GAME_PHASES.LANDING);
    }, []);

    const goToHowToPlay = useCallback(() => {
        leadFiredRef.current = false;
        setGamePhase(GAME_PHASES.HOW_TO_PLAY);
    }, []);

    const handleBookSlot = useCallback(async (formData) => {
        try {
            await submitToLMS({
                name: formData.name,
                mobile_no: formData.mobile,
                param4: formData.date,
                param19: formData.time,
                score: computeFinalScore(risksDestroyed, health, timeLeft),
                summary_dtls: 'Life Shield Bomber - Slot Booking',
                p_data_source: 'LIFE_SHIELD_BOMBER_BOOKING',
            });
        } catch {
            // Fail gracefully
        } finally {
            setGamePhase(GAME_PHASES.THANK_YOU);
        }
    }, []);

    const showThankYou = useCallback(() => {
        setGamePhase(GAME_PHASES.THANK_YOU);
    }, []);

    const finalScore = computeFinalScore(risksDestroyed, health, timeLeft);

    return {
        gamePhase,
        grid,
        playerPos,
        health,
        score,
        risksDestroyed,
        timeLeft,
        explosionCells,
        activePraise,
        floatingScores,
        entryDetails,
        shakeScreen,
        activeBomb,
        finalScore,

        movePlayer,
        placeBomb,
        handleEntrySubmit,
        startGame,
        exitGame,
        restartGame,
        goToHowToPlay,
        handleBookSlot,
        showThankYou,
    };
}
