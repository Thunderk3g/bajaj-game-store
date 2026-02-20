/**
 * useMatchGame — Balance Builder orchestration hook.
 * ══════════════════════════════════════════════════════════
 * PERFORMANCE-OPTIMIZED VERSION
 * - Lazy audio loading (on first interaction)
 * - Audio pool (max 2 channels, no cloneNode spam)
 * - Batched cascade: compute full chain in memory, dispatch ONCE
 * - Single reducer update per cascade cycle
 * - Ref-based state access in callbacks to prevent stale closures
 * ══════════════════════════════════════════════════════════
 */
import { useReducer, useCallback, useEffect, useRef } from 'react';
import { gameReducer, initialState, A } from './gameReducer.js';
import {
    GAME_PHASES,
    TILE_TYPES,
    PRAISE_MESSAGES,
    SCORING,
    computeFinalScore,
    allBucketsFull,
} from '../config/gameConfig.js';
import {
    findMatches,
    wouldCreateMatch,
    getMatchedTypes,
    removeMatches,
    applyGravity,
    refillGrid,
} from '../../../core/matchEngine/index.js';
import { submitToLMS } from '../services/apiClient.js';

// ── Lazy Audio (loaded on first interaction) ───────────────────
let audioLoaded = false;
const audioPool = { swap: [], burst: [] };
const MAX_AUDIO_CHANNELS = 2;

function ensureAudioLoaded() {
    if (audioLoaded) return;
    audioLoaded = true;

    // Dynamic import to avoid blocking initial load
    import('../../assets/audio/swapping.wav').then((mod) => {
        for (let i = 0; i < MAX_AUDIO_CHANNELS; i++) {
            const a = new Audio(mod.default);
            a.volume = 0.6;
            a.preload = 'auto';
            audioPool.swap.push(a);
        }
    }).catch(() => { });

    import('../../assets/audio/burst_audio.wav').then((mod) => {
        for (let i = 0; i < MAX_AUDIO_CHANNELS; i++) {
            const a = new Audio(mod.default);
            a.volume = 0.6;
            a.preload = 'auto';
            audioPool.burst.push(a);
        }
    }).catch(() => { });
}

// Pool index trackers
let swapIdx = 0;
let burstIdx = 0;

function playSound(type) {
    ensureAudioLoaded();
    const pool = audioPool[type];
    if (!pool || pool.length === 0) return;

    let idx;
    if (type === 'swap') {
        idx = swapIdx % pool.length;
        swapIdx++;
    } else {
        idx = burstIdx % pool.length;
        burstIdx++;
    }

    const audio = pool[idx];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }
}

// ── Float ID ───────────────────────────────────────────────────
let floatId = 0;
function nextFloatId() {
    return `f-${++floatId}`;
}

// ══════════════════════════════════════════════════════════════════
export function useMatchGame() {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Refs for hot-path access (avoids stale closures in callbacks)
    const stateRef = useRef(state);
    stateRef.current = state;

    const timerRef = useRef(null);
    const leadFiredRef = useRef(false);
    const praiseTimeoutRef = useRef(null);
    const voiceRef = useRef(null);

    // ── Preload Voices ─────────────────────────────────────────
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices();
            if (voices && voices.length > 0) {
                const femaleVoice = voices.find(v =>
                    v.name.includes('Zira') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Google US English') ||
                    v.name.includes('Female')
                );
                if (femaleVoice) voiceRef.current = femaleVoice;
            }
        };

        loadVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const speakPraise = useCallback((text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.1;
        utter.pitch = 1.2;
        utter.volume = 1.0;

        if (voiceRef.current) {
            utter.voice = voiceRef.current;
        } else {
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v =>
                v.name.includes('Zira') ||
                v.name.includes('Samantha') ||
                v.name.includes('Google US English') ||
                v.name.includes('Female')
            );
            if (femaleVoice) utter.voice = femaleVoice;
        }

        window.speechSynthesis.speak(utter);
    }, []);

    // ── Timer (1Hz countdown) ──────────────────────────────────
    useEffect(() => {
        if (state.gameStatus === GAME_PHASES.PLAYING) {
            timerRef.current = setInterval(() => {
                dispatch({ type: A.TICK });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.gameStatus]);

    // ── Win Condition Watcher ───────────────────────────────────
    useEffect(() => {
        if (state.gameStatus === GAME_PHASES.PLAYING) {
            if (allBucketsFull(state.buckets)) {
                dispatch({ type: A.FINISH_GAME });
            }
        }
    }, [state.gameStatus, state.buckets]);

    // ── Phase Transition Watcher ───────────────────────────────
    useEffect(() => {
        const { gameStatus } = state;

        if (gameStatus === GAME_PHASES.FINISHED) {
            if (timerRef.current) clearInterval(timerRef.current);
            const t = setTimeout(() => {
                dispatch({ type: A.SHOW_RESULT });
            }, 1500);
            return () => clearTimeout(t);
        }

        if (gameStatus === GAME_PHASES.EXITED) {
            if (timerRef.current) clearInterval(timerRef.current);

            if (!leadFiredRef.current && state.entryDetails) {
                leadFiredRef.current = true;
                const score = computeFinalScore(state.buckets);
                submitToLMS({
                    name: state.entryDetails.name,
                    mobile_no: state.entryDetails.mobile,
                    summary_dtls: `Balance Builder - Early Exit - Score: ${score}/100`,
                    p_data_source: 'BALANCE_BUILDER_LEAD',
                });
            }

            const t = setTimeout(() => {
                dispatch({ type: A.SHOW_RESULT });
            }, 800);
            return () => clearTimeout(t);
        }
    }, [state.gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cleanup ────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (praiseTimeoutRef.current) clearTimeout(praiseTimeoutRef.current);
        };
    }, []);

    const handleEntrySubmit = useCallback(async (name, mobile) => {
        ensureAudioLoaded();
        dispatch({ type: A.SET_ENTRY, payload: { name, mobile } });
        leadFiredRef.current = false;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        await submitToLMS({
            name: name.trim(),
            mobile_no: mobile,
            param4: dateStr,
            param19: '09:00 AM',
            summary_dtls: 'Balance Builder Lead',
            p_data_source: 'BALANCE_BUILDER_LEAD',
        });

        dispatch({ type: A.SHOW_HOW_TO_PLAY });
    }, []);

    const startGame = useCallback(() => {
        ensureAudioLoaded();
        dispatch({ type: A.START_GAME });
    }, []);

    // ── Cell Tap Logic ─────────────────────────────────────────
    const handleCellTap = useCallback(
        (row, col) => {
            const s = stateRef.current;
            if (s.isProcessing || s.gameStatus !== GAME_PHASES.PLAYING) return;

            const { selectedCell, grid } = s;

            if (!selectedCell) {
                dispatch({ type: A.SELECT_CELL, payload: { row, col } });
                return;
            }

            if (selectedCell.row === row && selectedCell.col === col) {
                dispatch({ type: A.DESELECT });
                return;
            }

            const { row: r1, col: c1 } = selectedCell;
            const r2 = row;
            const c2 = col;
            const isAdjacent = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);

            if (!isAdjacent) {
                dispatch({ type: A.SELECT_CELL, payload: { row, col } });
                return;
            }

            // Valid adjacency — attempt swap
            attemptSwapInternal(r1, c1, r2, c2);
        },
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    // ── Attempt Swap (uses ref for latest state) ───────────────
    const attemptSwapInternal = useCallback((r1, c1, r2, c2) => {
        const s = stateRef.current;
        if (s.isProcessing || s.gameStatus !== GAME_PHASES.PLAYING) return;
        const { grid } = s;

        if (!wouldCreateMatch(grid, r1, c1, r2, c2)) {
            dispatch({ type: A.APPLY_INVALID_SWAP });
            return;
        }

        playSound('swap');
        dispatch({ type: A.SET_PROCESSING, payload: true });

        // Perform swap in-memory
        const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
        const a = { ...newGrid[r1][c1] };
        const b = { ...newGrid[r2][c2] };
        newGrid[r1][c1] = { ...b, row: r1, col: c1 };
        newGrid[r2][c2] = { ...a, row: r2, col: c2 };

        resolveChain(newGrid);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Public wrapper for external swap (swipe gesture)
    const attemptSwap = useCallback((r1, c1, r2, c2) => {
        attemptSwapInternal(r1, c1, r2, c2);
    }, [attemptSwapInternal]);

    // ══════════════════════════════════════════════════════════════
    // BATCHED CASCADE RESOLUTION
    // Compute full cascade chain in-memory, then dispatch ONCE
    // per visual step (with minimal delay for animation).
    // ══════════════════════════════════════════════════════════════
    const resolveChain = useCallback(
        async (swappedGrid) => {
            let currentGrid = swappedGrid;
            let chainStep = 0;
            let totalPointsThisChain = 0;

            while (true) {
                const matchedKeys = findMatches(currentGrid);
                if (matchedKeys.size === 0) break;

                chainStep++;
                const matchLen = matchedKeys.size;
                const matchedTypes = [...getMatchedTypes(currentGrid, matchedKeys)];

                // Points calculation
                let pts = SCORING.match3;
                if (matchLen >= 5) pts = SCORING.match5;
                else if (matchLen >= 4) pts = SCORING.match4;
                const bonus = (chainStep > 1 ? SCORING.comboBonus : 0) + (chainStep > 2 ? SCORING.cascadeBonus : 0);
                totalPointsThisChain += pts + bonus;

                playSound('burst');

                // Single dispatch for this cascade step (visual + state)
                dispatch({
                    type: A.APPLY_MATCH,
                    payload: {
                        matchedTypes,
                        matchLen,
                        comboStep: chainStep,
                        explodingCells: [...matchedKeys],
                        newGrid: currentGrid,
                    },
                });

                // Float UI
                addFloat(`+${pts + bonus}`);

                // Compute next grid state in-memory
                const removed = removeMatches(currentGrid, matchedKeys);
                const gravitated = applyGravity(removed);
                currentGrid = refillGrid(gravitated, TILE_TYPES, 0);

                // Reduced delay for snappier cascades (was 450ms)
                await new Promise((res) => setTimeout(res, 300));
            }

            // Single batched final update
            dispatch({
                type: A.RESOLVE_CASCADE,
                payload: { grid: currentGrid },
            });

            // Praise after cascade settles
            if (chainStep >= 2 || totalPointsThisChain >= 25) {
                showPraise();
            }
        },
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const showPraise = useCallback(() => {
        const msg = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
        speakPraise(msg);
        dispatch({ type: A.SHOW_PRAISE, payload: msg });

        if (praiseTimeoutRef.current) clearTimeout(praiseTimeoutRef.current);
        praiseTimeoutRef.current = setTimeout(() => {
            dispatch({ type: A.HIDE_PRAISE });
        }, 1500);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const addFloat = useCallback((value) => {
        const id = nextFloatId();
        dispatch({
            type: A.ADD_FLOAT,
            payload: {
                id,
                value,
                x: 40 + Math.random() * 20,
                y: 40 + Math.random() * 20,
            },
        });
        setTimeout(() => {
            dispatch({ type: A.REMOVE_FLOAT, payload: id });
        }, 700);
    }, []);

    // ── Public Actions ─────────────────────────────────────────
    const exitGame = useCallback(() => {
        dispatch({ type: A.EXIT_GAME });
    }, []);

    const restartGame = useCallback(() => {
        leadFiredRef.current = false;
        dispatch({ type: A.RESTART_GAME });
    }, []);

    const showThankYou = useCallback(() => {
        dispatch({ type: A.SHOW_THANK_YOU });
    }, []);

    const handleBookSlot = useCallback(
        async (formData) => {
            console.log("handleBookSlot triggered", formData);
            try {
                // Race the API call against a 2-second timeout to prevent UI hanging
                const apiCall = submitToLMS({
                    name: formData.name,
                    mobile_no: formData.mobile,
                    param4: formData.date,
                    param19: formData.time,
                    summary_dtls: 'Balance Builder - Slot Booking',
                    p_data_source: 'BALANCE_BUILDER_BOOKING',
                });

                const timeout = new Promise(resolve => setTimeout(resolve, 2000));

                await Promise.race([apiCall, timeout]);
                console.log("Slot booking request processed");

            } catch (error) {
                console.error("Booking failed", error);
            } finally {
                // Always transition to Thank You
                console.log("Dispatching SHOW_THANK_YOU");
                dispatch({ type: A.SHOW_THANK_YOU });
            }
        },
        []
    );

    const finalScore = computeFinalScore(state.buckets);

    return {
        state,
        finalScore,
        handleEntrySubmit,
        startGame,
        handleCellTap,
        exitGame,
        restartGame,
        showThankYou,
        handleBookSlot,
        attemptSwap,
    };
}
