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

    // Initialize level
    useEffect(() => {
        setTubes(generateInitialTubes(config));
        setSelectedTube(null);
        setMoves(0);
        setMistakes(0);
        setHistory([]);
        setIsWon(false);
    }, [config]);

    const handleTubeClick = useCallback((index) => {
        if (isWon) return;

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

                    const colorToMove = sourceTube[sourceTube.length - 1].category;
                    let movedCount = 0;

                    // Move multiple segments if they match the color and there's space
                    while (
                        sourceTube.length > 0 &&
                        targetTube.length < config.capacity &&
                        sourceTube[sourceTube.length - 1].category === colorToMove
                    ) {
                        const segment = sourceTube.pop();
                        targetTube.push(segment);
                        movedCount++;
                    }

                    setTubes(newTubes);
                    setSelectedTube(null);
                    setMoves((prev) => prev + 1);

                    // Correct move feedback
                    if (Math.random() < 0.35) {
                        const messages = MESSAGE_LIBRARY.VALID_MOVE;
                        showToast(messages[Math.floor(Math.random() * messages.length)], 'success');
                    }

                    // Check Shock Condition
                    if (config.hasShock && !shockFired && moves + 1 >= 3) {
                        setTimeout(() => {
                            triggerShock();
                        }, 700);
                    }

                    // Check Win
                    const categoriesCount = config.elementsToInclude.length / (config.capacity / 4);
                    // Actually elementsToInclude is ID list. In our generator we have segments totaling to some categories.
                    const categoriesPresent = [...new Set(newTubes.flat().map(s => s.category))];

                    if (checkWin(newTubes, categoriesPresent.length, config.capacity)) {
                        setIsWon(true);
                        onLevelWin();
                    }
                } else {
                    // Invalid move feedback
                    setMistakes((prev) => prev + 1);
                    if (validation.reason === 'CATEGORY_MISMATCH') {
                        showToast(MESSAGE_LIBRARY.WRONG_CATEGORY, 'error');
                    } else if (validation.reason === 'TARGET_FULL') {
                        showToast(MESSAGE_LIBRARY.TUBE_FULL, 'error');
                    }
                    setSelectedTube(null);
                    // Shake animation handled by component via selectedTube being nullified
                }
            }
        }
    }, [tubes, selectedTube, config, isWon, moves, shockFired, triggerShock, onLevelWin, showToast]);

    const undo = useCallback(() => {
        if (history.length > 0) {
            const prevTubes = history[history.length - 1];
            setTubes(prevTubes);
            setHistory((prev) => prev.slice(0, -1));
            setSelectedTube(null);
        }
    }, [history]);

    const sortedCount = tubes.filter(t => isTubeSorted(t, config.capacity)).length;

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
    };
};
