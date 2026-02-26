import React, { useState, useEffect, useRef } from 'react';
import {
    BOARD_SIZE,
    getCellData,
    GameState,
    ScreenState,
    Cell
} from './features/GameLogic';
import { audioService } from './services/AudioService';

// Screens
import WelcomeScreen from './components/screens/WelcomeScreen';
import ShieldChoiceScreen from './components/screens/ShieldChoiceScreen';
import GameScreen from './components/screens/GameScreen';
import EventOverlay from './components/screens/EventOverlay';
import EndScreen from './components/screens/EndScreen';
import LeadCaptureScreen from './components/screens/LeadCaptureScreen';
import ThankYouScreen from './components/screens/ThankYouScreen';

interface AppProps {
    campaignId?: string;
    leadEndpoint?: string;
    environment?: 'dev' | 'prod';
    onGameStart?: () => void;
    onLeadSubmitted?: (payload: any) => void;
    onSnakeTriggered?: (snake: string) => void;
    onShieldActivated?: (shield: string) => void;
    onGameCompleted?: (score: number) => void;
}

const App: React.FC<AppProps> = ({
    onGameStart,
    onGameCompleted,
    onShieldActivated,
    onSnakeTriggered,
    onLeadSubmitted
}) => {
    const [gameState, setGameState] = useState<GameState>({
        playerPosition: 1,
        isGameOver: false,
        hasShield: false,
        lastDiceValue: 0,
        message: 'Roll the dice to move!',
        isMoving: false,
        currentScreen: 'welcome',
        isShieldOffer: false,
        gameHistory: [1],
        hadShieldAtEnd: false
    });

    const movementTimeoutRef = useRef<number | null>(null);

    // Core Dice logic
    const handleRoll = () => {
        if (gameState.isMoving || gameState.isGameOver) return;

        audioService.playDiceRoll();
        const dice = Math.floor(Math.random() * 6) + 1;

        setGameState(prev => ({
            ...prev,
            lastDiceValue: dice,
            isMoving: true,
            message: `You rolled a ${dice}!`
        }));

        animateMove(gameState.playerPosition, dice);
    };

    const animateMove = (startPos: number, steps: number) => {
        let currentStep = 1;

        const moveOneStep = () => {
            if (currentStep <= steps) {
                const nextPos = startPos + currentStep;
                if (nextPos <= BOARD_SIZE) {
                    setGameState(prev => ({ ...prev, playerPosition: nextPos }));
                    currentStep++;
                    // GDD 9.3: 90ms/step
                    movementTimeoutRef.current = window.setTimeout(moveOneStep, 90);
                } else {
                    finalizeMove(startPos + steps);
                }
            } else {
                finalizeMove(startPos + steps);
            }
        };

        moveOneStep();
    };

    const finalizeMove = (endPos: number) => {
        // Correct for board size
        const actualEndPos = endPos > BOARD_SIZE ? gameState.playerPosition : endPos;
        const cell = getCellData(actualEndPos);

        if (cell.type !== 'normal') {
            // Show event overlay
            setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    isMoving: false,
                    activeEvent: cell,
                    currentScreen: 'event'
                }));

                if (cell.type === 'snake') {
                    if (gameState.hasShield) {
                        audioService.playShieldSave();
                        if (onShieldActivated) onShieldActivated(cell.label!);
                    } else {
                        audioService.playSnakeBite();
                        if (onSnakeTriggered) onSnakeTriggered(cell.label!);
                    }
                } else if (cell.type === 'ladder') {
                    audioService.playLadderClimb();
                }
            }, 400);
        } else {
            setGameState(prev => {
                const isOver = actualEndPos === BOARD_SIZE;
                if (isOver) {
                    audioService.playWin();
                    if (onGameCompleted) onGameCompleted(100);
                    return {
                        ...prev,
                        isMoving: false,
                        isGameOver: true,
                        currentScreen: 'end',
                        hadShieldAtEnd: prev.hasShield,
                        playerPosition: actualEndPos
                    };
                }
                return {
                    ...prev,
                    isMoving: false,
                    playerPosition: actualEndPos,
                    message: `Reached square ${actualEndPos}`
                };
            });
        }
    };

    const handleEventContinue = () => {
        const event = gameState.activeEvent;
        if (!event) return;

        setGameState(prev => {
            let nextPos = prev.playerPosition;
            if (event.type === 'ladder') {
                nextPos = event.target!;
            } else if (event.type === 'snake' && !prev.hasShield) {
                nextPos = event.target!;
            }

            const isOver = nextPos === BOARD_SIZE;
            if (isOver) audioService.playWin();

            return {
                ...prev,
                playerPosition: nextPos,
                activeEvent: undefined,
                currentScreen: isOver ? 'end' : 'game',
                isGameOver: isOver,
                hadShieldAtEnd: isOver ? prev.hasShield : false
            };
        });
    };

    const handleAddShield = () => {
        setGameState(prev => ({
            ...prev,
            hasShield: true,
            message: 'Term Shield added! You are now protected.'
        }));
    };

    const handleLeadSubmit = (data: any) => {
        const payload = {
            ...data,
            hadShieldInGame: gameState.hadShieldAtEnd,
            finalPosition: gameState.playerPosition
        };
        if (onLeadSubmitted) onLeadSubmitted(payload);
        setGameState(prev => ({ ...prev, currentScreen: 'thank-you' }));
    };

    const resetGame = () => {
        setGameState({
            playerPosition: 1,
            isGameOver: false,
            hasShield: false,
            lastDiceValue: 0,
            message: 'Roll the dice to move!',
            isMoving: false,
            currentScreen: 'welcome',
            isShieldOffer: false,
            gameHistory: [1],
            hadShieldAtEnd: false
        });
    };

    // Render logic
    switch (gameState.currentScreen) {
        case 'welcome':
            return (
                <WelcomeScreen
                    onStart={(leadData) => {
                        if (onLeadSubmitted) onLeadSubmitted({ ...leadData, stage: 'pre-game' });
                        setGameState(prev => ({ ...prev, currentScreen: 'shield-choice' }));
                    }}
                />
            );

        case 'shield-choice':
            return (
                <ShieldChoiceScreen
                    onChoice={(choice) => {
                        setGameState(prev => ({ ...prev, hasShield: choice, currentScreen: 'game' }));
                        if (onGameStart) onGameStart();
                    }}
                />
            );

        case 'game':
        case 'event':
            return (
                <>
                    <GameScreen
                        playerPosition={gameState.playerPosition}
                        hasShield={gameState.hasShield}
                        isMoving={gameState.isMoving}
                        lastDice={gameState.lastDiceValue}
                        message={gameState.message}
                        onRoll={handleRoll}
                    />
                    {gameState.currentScreen === 'event' && gameState.activeEvent && (
                        <EventOverlay
                            event={gameState.activeEvent}
                            isShielded={gameState.hasShield}
                            onContinue={handleEventContinue}
                            onAddShield={gameState.activeEvent.type === 'snake' ? handleAddShield : undefined}
                        />
                    )}
                </>
            );

        case 'end':
            return (
                <EndScreen
                    hasShield={gameState.hadShieldAtEnd}
                    onCTA={() => setGameState(prev => ({ ...prev, currentScreen: 'lead-capture' }))}
                />
            );

        case 'lead-capture':
            return <LeadCaptureScreen onSubmit={handleLeadSubmit} />;

        case 'thank-you':
            return <ThankYouScreen onReplay={resetGame} />;

        default:
            return null;
    }
};

export default App;
