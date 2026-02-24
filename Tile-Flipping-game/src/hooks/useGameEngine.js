import { useCallback } from 'react';
import { ICONS, TOTAL_PAIRS, MISMATCH_DELAY, GAME_DURATION, MAX_FLIPS, TILE_PAIRS_COLORS } from '../constants/game';
import { ACTION, useGame } from '../context/GameContext';

/** Fisher-Yates shuffle */
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** Build a fresh shuffled tile array */
export function buildTiles() {
    const pairs = ICONS.flatMap((icon, index) => {
        const color = TILE_PAIRS_COLORS[index % TILE_PAIRS_COLORS.length];
        return [
            { id: `${icon.id}-a`, iconId: icon.id, emoji: icon.emoji, label: icon.label, color, isFlipped: false, isMatched: false },
            { id: `${icon.id}-b`, iconId: icon.id, emoji: icon.emoji, label: icon.label, color, isFlipped: false, isMatched: false },
        ];
    });
    return shuffle(pairs);
}

/** Convert seconds to MM:SS string */
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/** Return star rating (1-3) from score */
export function getStars(score) {
    if (score === TOTAL_PAIRS) return 3;
    if (score >= Math.floor(TOTAL_PAIRS * 0.6)) return 2;
    if (score > 0) return 1;
    return 0;
}

/** Return motivational message based on score */
export function getScoreMessage(score) {
    if (score === TOTAL_PAIRS) return '🏆 Perfect! You matched all pairs! Just like a complete insurance portfolio — nothing left uncovered.';
    if (score >= 6) return '🌟 Excellent! Almost perfect! A few gaps left — just like your insurance needs a quick review.';
    if (score >= 4) return '👍 Good effort! You\'re on the right track. Let\'s make sure your family stays fully protected.';
    if (score >= 2) return '💡 Not bad! A little more practice — just like building a strong insurance habit takes time.';
    return '🎯 Keep trying! Every expert started somewhere. Let\'s help you find the right plan to get started.';
}

/** Custom hook — game flow logic */
export function useGameEngine() {
    const { dispatch } = useGame();

    /** Initialise a fresh game */
    const initGame = useCallback(() => {
        dispatch({ type: ACTION.INIT_GAME, payload: { tiles: buildTiles() } });
    }, [dispatch]);

    /** Handle tile click */
    const flipTile = useCallback((state, index) => {
        const { tiles, selectedIndices, isLocked, isEnded } = state.game;
        const tile = tiles[index];

        // Guard conditions
        if (isLocked || isEnded) return;
        if (tile.isFlipped || tile.isMatched) return;
        if (selectedIndices.includes(index)) return;
        if (selectedIndices.length >= 2) return;
        if (state.game.flipsCount >= MAX_FLIPS) {
            dispatch({ type: ACTION.END_GAME });
            return;
        }

        dispatch({ type: ACTION.FLIP_TILE, payload: { index } });

        // If this is the 2nd flip — check for match
        if (selectedIndices.length === 1) {
            const idxA = selectedIndices[0];
            const idxB = index;
            const tileA = tiles[idxA];
            const tileB = tiles[idxB];

            if (tileA.iconId === tileB.iconId) {
                // MATCH
                setTimeout(() => {
                    dispatch({ type: ACTION.RESOLVE_MATCH, payload: { idxA, idxB } });
                }, 350);
            } else {
                // MISMATCH
                setTimeout(() => {
                    dispatch({ type: ACTION.RESOLVE_MISMATCH, payload: { idxA, idxB } });
                }, MISMATCH_DELAY);
            }
        }
    }, [dispatch]);

    /** End game (called by timer or when all pairs found) */
    const endGame = useCallback(() => {
        dispatch({ type: ACTION.END_GAME });
    }, [dispatch]);

    return { initGame, flipTile, endGame };
}
