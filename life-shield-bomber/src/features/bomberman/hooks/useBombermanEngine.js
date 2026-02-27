/**
 * useBombermanEngine — Main orchestration hook for Shield Guardian.
 *
 * GAME LOGIC:
 *   - Player moves on grid, can walk OVER risk blocks to "claim" them (+10 score)
 *   - Shield is thrown in current facing direction — only targets RED MONSTERS
 *   - Monsters roam and deal damage on contact
 *   - Power-ups are collected by walking over them
 *   - Survive 90 seconds
 *
 * SCORING:
 *   Risk Block claimed (walked over): +10
 *   Monster destroyed (shield hit):   +15
 *   Power-up collected:               +5
 *   Remaining health bonus:           +10 per heart
 *   Time bonus:                       scaled
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    GAME_PHASES,
    GAME_DURATION_SECONDS,
    INITIAL_HEALTH,
    POINTS_PER_RISK,
    CELL_TYPES,
    DIRECTIONS,
    PRAISE_MESSAGES,
} from '../constants/gameConstants.js';
import {
    generateGrid,
    isInBounds,
    cloneGrid,
    computeFinalScore,
} from '../utils/gridUtils.js';
import { submitToLMS } from '../services/apiClient.js';
import { useShieldSystem } from './useShieldSystem.js';
import { useMonsterSystem } from './useMonsterSystem.js';
import { usePowerupSystem, POWERUP_TYPES } from './usePowerupSystem.js';

const MOVE_COOLDOWN = 120;
const MONSTER_SCORE = 15;
const POWERUP_SCORE = 5;

export function useBombermanEngine() {
    const [gamePhase, setGamePhase] = useState(GAME_PHASES.LANDING);
    const [grid, setGrid] = useState(() => generateGrid());
    const [playerPos, setPlayerPos] = useState({ row: 1, col: 1 });
    const [lastDirection, setLastDirection] = useState('RIGHT');
    const [health, setHealth] = useState(INITIAL_HEALTH);
    const [score, setScore] = useState(0);
    const [risksDestroyed, setRisksDestroyed] = useState(0);
    const [monstersDefeated, setMonstersDefeated] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
    const [activePraise, setActivePraise] = useState(null);
    const [floatingScores, setFloatingScores] = useState([]);
    const [entryDetails, setEntryDetails] = useState(null);
    const [shakeScreen, setShakeScreen] = useState(false);
    const [isInvulnerable, setIsInvulnerable] = useState(false);

    const gridRef = useRef(grid);
    const playerPosRef = useRef(playerPos);
    const isPlayingRef = useRef(false);
    const timerRef = useRef(null);
    const gameLoopRef = useRef(null);
    const lastMoveRef = useRef(0);
    const leadFiredRef = useRef(false);
    const praiseTimeoutRef = useRef(null);
    const floatIdRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const isInvulnerableRef = useRef(false);

    const timeFreezeEndRef = useRef(0);
    const multiShieldEndRef = useRef(0);
    const isPenetrationRef = useRef(false);
    const penetrationEndRef = useRef(0);

    gridRef.current = grid;
    playerPosRef.current = playerPos;

    useEffect(() => {
        isPlayingRef.current = gamePhase === GAME_PHASES.PLAYING;
    }, [gamePhase]);

    // Sub-systems
    const {
        shields,
        fireShield,
        updateShields,
        getCooldownProgress,
        clearShields
    } = useShieldSystem(gridRef);

    const {
        monsters,
        monstersRef,
        initMonsters,
        updateMonsters,
        removeMonster,
        clearMonsters
    } = useMonsterSystem(gridRef);

    const {
        activePowerup,
        checkPowerupSpawn,
        collectPowerup,
        clearPowerups
    } = usePowerupSystem(gridRef);

    // ── Floating Score ─────────────────────────────────────────────
    const addFloatingScore = useCallback((value, row, col) => {
        const id = `fs-${++floatIdRef.current}`;
        setFloatingScores(prev => [...prev, { id, value, row, col }]);
        setTimeout(() => {
            setFloatingScores(prev => prev.filter(f => f.id !== id));
        }, 800);
    }, []);

    const showPraise = useCallback((customMsg) => {
        const msg = customMsg || PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
        setActivePraise(msg);

        if (praiseTimeoutRef.current) clearTimeout(praiseTimeoutRef.current);
        praiseTimeoutRef.current = setTimeout(() => {
            setActivePraise(null);
        }, 1200);
    }, []);

    // ── Damage ─────────────────────────────────────────────────────
    const handleDamage = useCallback(() => {
        if (isInvulnerableRef.current) return;
        isInvulnerableRef.current = true;
        setIsInvulnerable(true);

        setHealth(prev => {
            const newHealth = prev - 1;
            if (newHealth <= 0) {
                setTimeout(() => endGame(), 300);
            }
            return Math.max(0, newHealth);
        });
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 300);
        setTimeout(() => {
            isInvulnerableRef.current = false;
            setIsInvulnerable(false);
        }, 1000);
    }, []);

    // ── Game Loop ──────────────────────────────────────────────────
    const gameLoop = useCallback((timestamp) => {
        if (!isPlayingRef.current) return;
        const delta = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        const now = Date.now();
        const isTimeFrozen = now < timeFreezeEndRef.current;

        // Check penetration duration
        if (isPenetrationRef.current && now >= penetrationEndRef.current) {
            isPenetrationRef.current = false;
        }

        // Shield only targets monsters — no risk block destruction
        updateShields(
            delta,
            (monsterId) => {
                // Find monster position before removing for floating score
                const monster = monstersRef.current.find(m => m.id === monsterId);
                const mRow = monster ? monster.row : playerPosRef.current.row;
                const mCol = monster ? monster.col : playerPosRef.current.col;

                removeMonster(monsterId);
                setMonstersDefeated(prev => prev + 1);
                setScore(prev => prev + MONSTER_SCORE);
                addFloatingScore(`+${MONSTER_SCORE}`, mRow, mCol);
                showPraise('Threat Neutralized!');
            },
            monstersRef,
            isPenetrationRef.current
        );

        updateMonsters(
            now,
            playerPosRef.current,
            isTimeFrozen,
            () => handleDamage()
        );

        checkPowerupSpawn(now);

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [updateShields, updateMonsters, checkPowerupSpawn, handleDamage, removeMonster, addFloatingScore, showPraise]);

    useEffect(() => {
        if (gamePhase === GAME_PHASES.PLAYING) {
            lastTimeRef.current = performance.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gamePhase, gameLoop]);

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
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gamePhase]);

    // ── Cleanup ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
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

        setLastDirection(direction);

        const currentPos = playerPosRef.current;
        const newRow = currentPos.row + dir.row;
        const newCol = currentPos.col + dir.col;

        if (!isInBounds(newRow, newCol)) return;

        const currentGrid = gridRef.current;
        const targetCell = currentGrid[newRow][newCol];

        // Block only on walls — risk blocks are walkable (claimed on contact)
        if (targetCell.type === CELL_TYPES.WALL) return;

        lastMoveRef.current = now;
        setPlayerPos({ row: newRow, col: newCol });

        // ── Claim risk block by walking over it ──
        if (targetCell.type === CELL_TYPES.RISK) {
            const label = targetCell.riskData?.label || 'Risk';
            const newGrid = cloneGrid(currentGrid);
            newGrid[newRow][newCol].type = CELL_TYPES.FLOOR;
            newGrid[newRow][newCol].riskData = null;
            setGrid(newGrid);

            setRisksDestroyed(prev => prev + 1);
            setScore(prev => prev + POINTS_PER_RISK);
            addFloatingScore(`+${POINTS_PER_RISK}`, newRow, newCol);
            showPraise(`${label} Secured! 🛡️`);
        }

        // ── Collect power-up ──
        const collected = collectPowerup(newRow, newCol);
        if (collected) {
            setScore(s => s + POWERUP_SCORE);
            addFloatingScore(`+${POWERUP_SCORE}`, newRow, newCol);

            if (collected.type === POWERUP_TYPES.HEALTH_RESTORE) {
                setHealth(h => Math.min(INITIAL_HEALTH, h + 1));
                showPraise('Health Restored! ❤️');
            } else if (collected.type === POWERUP_TYPES.TIME_FREEZE) {
                timeFreezeEndRef.current = Date.now() + 3000;
                showPraise('Time Freeze! ❄️');
            } else if (collected.type === POWERUP_TYPES.MULTI_SHIELD) {
                multiShieldEndRef.current = Date.now() + 10000;
                showPraise('Multi-Shield! 🛡️×3');
            } else if (collected.type === POWERUP_TYPES.SHIELD_PENETRATION) {
                isPenetrationRef.current = true;
                penetrationEndRef.current = Date.now() + 10000;
                showPraise('Piercing Shield! ⚡');
            }
        }

        // ── Monster collision ──
        if (monstersRef.current) {
            const hit = monstersRef.current.find(
                m => m.active && m.row === newRow && m.col === newCol
            );
            if (hit) handleDamage();
        }

        if (targetCell.type === CELL_TYPES.EXIT) {
            let hasRisks = false;
            for (let r = 0; r < currentGrid.length; r++) {
                for (let c = 0; c < currentGrid[0].length; c++) {
                    if (currentGrid[r][c].type === CELL_TYPES.RISK) {
                        hasRisks = true;
                        break;
                    }
                }
                if (hasRisks) break;
            }

            if (hasRisks) {
                showPraise('Claim all Risks to Exit! 🛡️');
            } else {
                endGame();
            }
        }
    }, [collectPowerup, handleDamage, addFloatingScore, showPraise]);

    // ── Shield Action ──────────────────────────────────────────────
    const handleAction = useCallback(() => {
        if (!isPlayingRef.current) return;
        const isMulti = Date.now() < multiShieldEndRef.current;
        fireShield(playerPosRef.current.row, playerPosRef.current.col, lastDirection, isMulti);
    }, [fireShield, lastDirection]);

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
                handleAction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gamePhase, movePlayer, handleAction]);

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
        setLastDirection('RIGHT');
        setHealth(INITIAL_HEALTH);
        setScore(0);
        setRisksDestroyed(0);
        setMonstersDefeated(0);
        setTimeLeft(GAME_DURATION_SECONDS);
        setActivePraise(null);
        setFloatingScores([]);
        setShakeScreen(false);
        setIsInvulnerable(false);
        isInvulnerableRef.current = false;

        clearShields();
        clearMonsters();
        clearPowerups();

        initMonsters(1, 1);

        timeFreezeEndRef.current = 0;
        multiShieldEndRef.current = 0;
        isPenetrationRef.current = false;
        penetrationEndRef.current = 0;

        setGamePhase(GAME_PHASES.PLAYING);
    }, [clearShields, clearMonsters, clearPowerups, initMonsters]);

    const endGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        setGamePhase(GAME_PHASES.FINISHED);

        setTimeout(() => {
            setGamePhase(GAME_PHASES.RESULT);
        }, 1500);
    }, []);

    const exitGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);

        if (!leadFiredRef.current && entryDetails) {
            leadFiredRef.current = true;
            const finalScoreVal = computeFinalScore(risksDestroyed, monstersDefeated, health, timeLeft);
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
    }, [entryDetails, risksDestroyed, monstersDefeated, health, timeLeft]);

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

    const finalScore = computeFinalScore(risksDestroyed, monstersDefeated, health, timeLeft);

    return {
        gamePhase,
        grid,
        playerPos,
        health,
        score,
        risksDestroyed,
        timeLeft,
        activePraise,
        floatingScores,
        entryDetails,
        shakeScreen,
        finalScore,

        isInvulnerable,
        shields,
        monsters,
        activePowerup,
        getCooldownProgress,

        movePlayer,
        placeBomb: handleAction,
        handleEntrySubmit,
        startGame,
        exitGame,
        restartGame,
        goToHowToPlay,
        handleBookSlot,
        showThankYou,
    };
}
