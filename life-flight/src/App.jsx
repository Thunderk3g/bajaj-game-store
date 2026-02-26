import React, { lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './features/flight/context/GameContext.jsx';

// ── Lazy-loaded pages ─────────────────────────────────────────
const LandingPage = lazy(() => import('./features/flight/pages/LandingPage.jsx'));
const GamePage = lazy(() => import('./features/flight/pages/GamePage.jsx'));
const GameOverPage = lazy(() => import('./features/flight/pages/GameOverPage.jsx'));
const LeadPage = lazy(() => import('./features/flight/pages/LeadPage.jsx'));
const SuccessPage = lazy(() => import('./features/flight/pages/SuccessPage.jsx'));

// ── Error boundary ────────────────────────────────────────────
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100vh', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: '#0A2540', color: '#fff', padding: 24,
                    }}
                >
                    <div style={{ fontSize: 48 }}>⚠️</div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 12, marginBottom: 8 }}>
                        Something went wrong
                    </h2>
                    <p style={{ fontSize: 14, color: '#90E0EF', marginBottom: 24 }}>
                        Please refresh the page to restart your flight.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 28px', borderRadius: 16, fontWeight: 700, fontSize: 15,
                            background: 'linear-gradient(135deg, #00B4D8, #2DC653)', color: '#fff', border: 'none',
                        }}
                    >
                        Refresh
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Loading fallback ──────────────────────────────────────────
function Loading() {
    return (
        <div
            style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0A2540',
            }}
        >
            <div className="shield-glow" style={{ fontSize: 52 }}>🛡️</div>
        </div>
    );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
    return (
        <ErrorBoundary>
            <GameProvider>
                <div className="fixed inset-0 w-full h-full bg-[#020a11] flex justify-center items-center overflow-hidden">
                    {/* Mobile-centric constrained view */}
                    <div className="relative w-full max-w-[430px] h-full lg:max-h-[850px] bg-white shadow-[0_0_60px_rgba(0,0,0,0.4)] overflow-hidden lg:rounded-[2rem]">
                        <BrowserRouter>
                            <Suspense fallback={<Loading />}>
                                <Routes>
                                    <Route path="/" element={<LandingPage />} />
                                    <Route path="/game" element={<GamePage />} />
                                    <Route path="/gameover" element={<GameOverPage />} />
                                    <Route path="/lead" element={<LeadPage />} />
                                    <Route path="/success" element={<SuccessPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                    </div>
                </div>
            </GameProvider>
        </ErrorBoundary>
    );
}
