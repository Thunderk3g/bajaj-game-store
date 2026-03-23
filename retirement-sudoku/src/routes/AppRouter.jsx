import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GameProvider } from '../features/game/context/GameContext.jsx';
import { GAME_PHASES } from '../features/game/context/gameReducer.js';
import { useGame } from '../features/game/context/GameContext.jsx';

const IntroPage = lazy(() => import('../pages/IntroPage.jsx'));
const GamePage = lazy(() => import('../pages/GamePage.jsx'));
const LeadPage = lazy(() => import('../pages/LeadCapturePage.jsx'));
const ResultPage = lazy(() => import('../pages/ResultPage.jsx'));
const ThankYouPage = lazy(() => import('../pages/ThankYouPage.jsx'));

function PageFallback() {
    return (
        <div className="vh-fix flex items-center justify-center bg-sudoku-bg">
            <div className="w-8 h-8 border-2 border-sudoku-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

/**
 * Guard: redirect to intro if game hasn't started.
 */
function GameGuard({ children }) {
    const { state } = useGame();
    const location = useLocation();

    if (state.phase === GAME_PHASES.INTRO) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
}

/**
 * Inner router — inside GameProvider so guards can access context.
 */
function InnerRouter() {
    return (
        <Suspense fallback={<PageFallback />}>
            <Routes>
                <Route path="/" element={<IntroPage />} />
                <Route
                    path="/game"
                    element={
                        <GameGuard>
                            <GamePage />
                        </GameGuard>
                    }
                />
                <Route path="/result" element={<ResultPage />} />
                <Route path="/lead" element={<LeadPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

/**
 * App router wrapped in GameProvider.
 * GameProvider must be ancestor of all game-aware components.
 */
function AppRouter() {
    return (
        <GameProvider>
            <InnerRouter />
        </GameProvider>
    );
}

export default AppRouter;
