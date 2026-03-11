import { useState, useCallback, useEffect, useMemo } from 'react';
import { generateInitialTubes, isTubeSorted, checkWin } from '../utils/tubeHelpers';
import { isValidMove } from '../utils/moveValidator';
import { LEVEL_CONFIGS } from '../utils/levelConfigs';
import { MESSAGE_LIBRARY } from '../constants/messageLibrary';

export const useLifeSortedEngine = (currentLevelIndex, onLevelWin, showToast, triggerShock, shockFired) => {
    const config = useMemo(() => LEVEL_CONFIGS[currentLevelIndex], [currentLevelIndex]);

    const [tubes, setTubes] = useState([]);
    const [selectedTube, setSelectedTube] = useState(null);
    const [moves, setMoves] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [history, setHistory] = useState([]);
    const [isWon, setIsWon] = useState(false);
    const [levelLoaded, setLevelLoaded] = useState(-1);
    const [newlySortedTubes, setNewlySortedTubes] = useState([]);

    const reset = useCallback(() => {
        setIsWon(false);
        setTubes(generateInitialTubes(config));
        setSelectedTube(null);
        setMoves(0);
        setMistakes(0);
        setHistory([]);
        setNewlySortedTubes([]);
        setLevelLoaded(currentLevelIndex);
    }, [config, currentLevelIndex]);

    // Initialize level
    useEffect(() => {
        reset();
    }, [reset]);

    const handleTubeClick = useCallback((index) => {
        if (isWon || levelLoaded !== currentLevelIndex) return;

        if (selectedTube === null) {
            if (tubes[index].length > 0) {
                setSelectedTube(index);
            }
        } else {
            if (selectedTube === index) {
                setSelectedTube(null);
            } else {
                // Attempt pour
                const validation = isValidMove(tubes[selectedTube], tubes[index], config.capacity);

                if (validation.valid) {
                    // Save history for undo
                    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(tubes))]);

                    const newTubes = [...tubes.map(t => [...t])];
                    const sourceTube = newTubes[selectedTube];
                    const targetTube = newTubes[index];

                    // CRITICAL: Move only ONE segment per tap
                    const segment = sourceTube.pop();
                    targetTube.push(segment);

                    setTubes(newTubes);
                    setSelectedTube(null);
                    setMoves((prev) => prev + 1);

                    // Check if target tube just became sorted (only category tubes 0-4)
                    const activeCats = config.tubesCount - (config.emptyTubes || 0);
                    const categoryMapping = ['growth', 'safety', 'resp', 'risk', 'asset'];
                    const expectedCat = categoryMapping[index];

                    if (index < activeCats && isTubeSorted(newTubes[index], config.capacity, expectedCat)) {
                        setNewlySortedTubes(prev => [...prev, index]);

                        // Use actual segment category for toast name
                        const actualCategory = newTubes[index][0]?.category;
                        const catNames = { growth: 'Growth', safety: 'Safety', resp: 'Family', risk: 'Risk', asset: 'Assets' };
                        const catName = catNames[actualCategory] || actualCategory;
                        showToast(`${catName} sorted! 🎉`, 'success');

                        // Clear newly sorted state after animation duration
                        setTimeout(() => {
                            setNewlySortedTubes(prev => prev.filter(i => i !== index));
                        }, 2000);
                    } else if (Math.random() < 0.35) {
                        // Correct move feedback - 35% chance (only if not a sort celebration)
                        const messages = MESSAGE_LIBRARY.VALID_MOVE;
                        showToast(messages[Math.floor(Math.random() * messages.length)], 'success');
                    }

                    // Check Shock Condition
                    if (config.hasShock && !shockFired && (moves + 1) >= 3) {
                        setTimeout(() => {
                            triggerShock();
                        }, 700);
                    }

                    // Check Win
                    const categoriesPresent = [...new Set(newTubes.flat().map(s => s.category))];

                    if (checkWin(newTubes, categoriesPresent.length, config.capacity)) {
                        setIsWon(true);
                        onLevelWin();
                    }
                } else {
                    // Invalid move feedback
                    setMistakes((prev) => prev + 1);
                    if (validation.reason === 'CATEGORY_MISMATCH') {
                        const messages = MESSAGE_LIBRARY.WRONG_CATEGORY;
                        showToast(messages[Math.floor(Math.random() * messages.length)], 'error');
                    } else if (validation.reason === 'TARGET_FULL') {
                        const messages = MESSAGE_LIBRARY.TUBE_FULL;
                        showToast(messages[Math.floor(Math.random() * messages.length)], 'error');
                    }
                    setSelectedTube(null);
                    // Shake animation handled by component via selectedTube being nullified
                }
            }
        }
    }, [tubes, selectedTube, config, isWon, moves, shockFired, triggerShock, onLevelWin, showToast, levelLoaded, currentLevelIndex]);

    const undo = useCallback(() => {
        if (history.length > 0) {
            const prevTubes = history[history.length - 1];
            setTubes(prevTubes);
            setHistory((prev) => prev.slice(0, -1));
            setSelectedTube(null);
        }
    }, [history]);

    // Only count sorted from category tubes (first N) matching their designated slots
    const activeTubesCount = config.tubesCount - (config.emptyTubes || 0);
    const categoryMapping = ['growth', 'safety', 'resp', 'risk', 'asset'];
    const sortedCount = tubes.slice(0, activeTubesCount).filter((t, i) =>
        isTubeSorted(t, config.capacity, categoryMapping[i])
    ).length;

    return {
        tubes,
        selectedTube,
        moves,
        mistakes,
        handleTubeClick,
        validateMove: (from, to) => isValidMove(tubes[from], tubes[to], config.capacity),
        undo,
        sortedCount,
        isWon,
        canUndo: history.length > 0,
        levelLoaded,
        newlySortedTubes,
        reset
    };
};
