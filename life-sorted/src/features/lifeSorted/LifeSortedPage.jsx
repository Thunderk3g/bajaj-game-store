import React, { useState, useCallback, useMemo, useRef } from 'react';
import GameLayout from '../../components/layout/GameLayout';
import SplashScreen from './components/SplashScreen';
import GameScreen from './components/GameScreen';
import LevelReport from './components/LevelReport';
import FinalScreen from './components/FinalScreen';
import ShockOverlay from './components/ShockOverlay';
import PouringStream from './components/PouringStream';
import Toast from '../../components/ui/Toast';

import { useLifeSortedEngine } from './hooks/useLifeSortedEngine';
import { useTimer } from './hooks/useTimer';
import { useShockSystem } from './hooks/useShockSystem';
import { useToastSystem } from './hooks/useToastSystem';
import { useScoreCalculator } from './hooks/useScoreCalculator';
import { leadService } from './services/leadService';
import { LEVEL_CONFIGS } from './utils/levelConfigs';
import { MESSAGE_LIBRARY } from './constants/messageLibrary';

const LifeSortedPage = () => {
    const [gamePhase, setGamePhase] = useState('splash'); // splash | playing | shock | report | final
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [pouringState, setPouringState] = useState(null); // { sourceIndex, targetIndex, color, sourceX, sourceY, targetX, targetY }
    const tubeRefs = useRef([]);

    const { toast, showToast } = useToastSystem();
    const { stats, updateStats, getResults } = useScoreCalculator();

    const handleLevelWin = useCallback(() => {
        // Logic handled by useEffect watching engine.isWon
    }, []);

    const {
        shockFired,
        isShockActive,
        triggerShock,
        resolveShock,
        resetShock
    } = useShockSystem(useCallback(() => {
        showToast(MESSAGE_LIBRARY.SHOCK_EVENT, 'warning');
    }, [showToast]));

    const engine = useLifeSortedEngine(
        currentLevelIndex,
        handleLevelWin,
        showToast,
        triggerShock,
        shockFired
    );

    const handleTubeClickWithAnimation = useCallback((index) => {
        // FIXED: Block all interactions while a pour is in progress
        if (engine.isWon || isShockActive || pouringState) return;

        const sourceIndex = engine.selectedTube;

        if (sourceIndex !== null && sourceIndex !== index) {
            const sourceTube = engine.tubes[sourceIndex];
            const targetTube = engine.tubes[index];
            const capacity = LEVEL_CONFIGS[currentLevelIndex].capacity;

            if (sourceTube.length > 0 && targetTube.length < capacity) {
                // OLD RULE: Match top color. 
                // NEW RULE: Allow any color pour (moveValidator handles this)
                const validation = engine.validateMove(sourceIndex, index);

                if (validation.valid) {
                    const sourceTop = sourceTube[sourceTube.length - 1];
                    const sourceRect = tubeRefs.current[sourceIndex]?.getBoundingClientRect();
                    const targetRect = tubeRefs.current[index]?.getBoundingClientRect();

                    if (sourceRect && targetRect) {
                        const isRight = index > sourceIndex;
                        const mouthXOffset = isRight ? -14 : 14; // Reduced offset for closer alignment

                        const dx = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2) + mouthXOffset;
                        const dy = targetRect.top - sourceRect.top - 160;

                        // Calculate how many segments will move
                        const colorToMove = sourceTop.category;
                        let movedCount = 0;
                        const tempSource = [...sourceTube];
                        while (tempSource.length > 0 && tempSource[tempSource.length - 1].category === colorToMove && (targetTube.length + movedCount) < capacity) {
                            tempSource.pop();
                            movedCount++;
                        }

                        setPouringState({
                            sourceIndex,
                            targetIndex: index,
                            color: sourceTop.color,
                            // Align stream start exactly with the pivot/mouth position
                            sourceX: targetRect.left + targetRect.width / 2 + mouthXOffset,
                            sourceY: targetRect.top - 50,
                            targetX: targetRect.left + targetRect.width / 2,
                            targetY: targetRect.top,
                            dx,
                            dy,
                            movedCount,
                            movedColor: sourceTop.color,
                            isStreaming: false
                        });

                        setTimeout(() => {
                            setPouringState(prev => prev ? { ...prev, isStreaming: true } : null);
                        }, 350);

                        // Unified update to prevent "segments increasing" bug
                        setTimeout(() => {
                            engine.handleTubeClick(index);
                            setPouringState(null);
                        }, 1100);

                        return;
                    }
                }
            }
        }

        engine.handleTubeClick(index);
    }, [engine, currentLevelIndex, isShockActive, pouringState]);

    const handleTimeUp = useCallback(() => {
        showToast(MESSAGE_LIBRARY.TIME_UP, 'error');
        updateStats(engine.moves, engine.mistakes, engine.sortedCount);
        setGamePhase('final');
    }, [engine.moves, engine.mistakes, engine.sortedCount, updateStats, showToast]);

    const handleWarning = useCallback((time) => {
        if (time === 60 || time === 30 || time === 10) {
            showToast(`${time} seconds remaining!`, time <= 30 ? 'warning' : 'info');
        }
    }, [showToast]);

    const timer = useTimer(120, handleTimeUp, handleWarning);

    const startGame = () => {
        setGamePhase('playing');
        timer.start();
    };

    const nextLevel = () => {
        updateStats(engine.moves, engine.mistakes, engine.sortedCount);
        if (currentLevelIndex < LEVEL_CONFIGS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
            setGamePhase('playing');
            timer.reset();
            timer.start();
            resetShock();
        } else {
            setGamePhase('final');
        }
    };

    const restartLevel = () => {
        timer.reset();
        timer.start();
        resetShock();
    };

    const onLevelComplete = () => {
        timer.stop();
        setGamePhase('report');
    };

    React.useEffect(() => {
        if (engine.isWon && gamePhase === 'playing') {
            onLevelComplete();
        }
    }, [engine.isWon, gamePhase]);

    const activeCategories = useMemo(() => {
        return [...new Set(engine.tubes.flat().map(s => s.category))];
    }, [engine.tubes]);

    return (
        <GameLayout
            showTitle={gamePhase !== 'playing'}
            headerRight={
                gamePhase === 'playing' ? (
                    <div className="text-right">
                        <p className="text-[0.6rem] uppercase text-white/40 tracking-widest font-bold">Progress</p>
                        <p className="text-xs font-bold text-teal">{engine.sortedCount} / {activeCategories.length} Sorted</p>
                    </div>
                ) : null
            }
        >
            <Toast message={toast?.message} type={toast?.type} />

            {gamePhase === 'splash' && <SplashScreen onStart={startGame} />}

            {gamePhase === 'playing' && (
                <>
                    <GameScreen
                        tubes={engine.tubes}
                        capacity={LEVEL_CONFIGS[currentLevelIndex].capacity}
                        selectedTube={engine.selectedTube}
                        onTubeClick={handleTubeClickWithAnimation}
                        onUndo={engine.undo}
                        onRestart={restartLevel}
                        timer={timer.timeLeft}
                        formatTime={timer.formatTime}
                        progress={timer.progress}
                        isUrgent={timer.isUrgent}
                        activeCategories={activeCategories}
                        moves={engine.moves}
                        currentLevel={currentLevelIndex + 1}
                        pouringState={pouringState}
                        tubeRefs={tubeRefs}
                    />
                    <ShockOverlay isActive={isShockActive} onResolve={resolveShock} />
                    {pouringState && <PouringStream {...pouringState} />}
                </>
            )}

            {gamePhase === 'report' && (
                <LevelReport
                    level={currentLevelIndex + 1}
                    moves={engine.moves}
                    mistakes={engine.mistakes}
                    sorted={engine.sortedCount}
                    onNext={nextLevel}
                />
            )}

            {gamePhase === 'final' && (
                <FinalScreen
                    results={getResults()}
                    onRetry={() => window.location.reload()}
                    leadService={leadService}
                />
            )}
        </GameLayout>
    );
};

export default LifeSortedPage;
