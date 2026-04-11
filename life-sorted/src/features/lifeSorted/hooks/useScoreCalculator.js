import { useState, useCallback } from 'react';
import { calculateClarityScore } from '../utils/scoreFormula';
import { resolveArchetype } from '../utils/archetypeResolver';

export const useScoreCalculator = () => {
    const [stats, setStats] = useState({
        totalMoves: 0,
        totalMistakes: 0,
        totalSortedAcrossLevels: 0,
    });

    const updateStats = useCallback((levelMoves, levelMistakes, levelSorted) => {
        setStats((prev) => ({
            totalMoves: prev.totalMoves + levelMoves,
            totalMistakes: prev.totalMistakes + levelMistakes,
            totalSortedAcrossLevels: prev.totalSortedAcrossLevels + levelSorted,
        }));
    }, []);

    const resetStats = useCallback(() => {
        setStats({
            totalMoves: 0,
            totalMistakes: 0,
            totalSortedAcrossLevels: 0,
        });
    }, []);

    const getResults = useCallback(() => {
        const score = calculateClarityScore(
            stats.totalMoves,
            stats.totalMistakes,
            stats.totalSortedAcrossLevels
        );

        const archetype = resolveArchetype(
            score,
            stats.totalMistakes,
            stats.totalMoves
        );

        return {
            score,
            archetype,
            ...stats,
        };
    }, [stats]);

    return { stats, updateStats, getResults, resetStats };
};
