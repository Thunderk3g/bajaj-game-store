// App.jsx — Home → Game → Lead → Results → (optional Slot) → ThankYou
import React, { useCallback, useState } from 'react';
import BubbleShooter from './BubbleShooter.jsx';
import { HomeScreen, ResultsScreen } from './Screens.jsx';
import LeadCaptureModal from './LeadCaptureModal.jsx';
import SlotBookingModal from './SlotBookingModal.jsx';
import ThankYouScreen from './ThankYouScreen.jsx';
import { LEAD_NO_KEY } from './api.js';
import { LEVELS } from './data.js';

const THEME = {
  homeBg: 'linear-gradient(180deg, #0B1E5B 0%, #1B2A6E 50%, #061343 100%)',
  gameBg: 'linear-gradient(180deg, #0F1B4D 0%, #1B2A6E 60%, #2C3F8F 100%)',
};

export default function App() {
  const [screen, setScreen] = useState('home');     // home | game | results | thankyou
  const [levelIdx, setLevelIdx] = useState(0);
  const [stats, setStats] = useState({});
  const [won, setWon] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  const level = LEVELS[levelIdx];

  const startGame = useCallback(() => {
    setScreen('game');
    setGameKey((k) => k + 1);
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
    setLevelIdx(0);
    setBookedDetails(null);
  }, []);

  const finishRound = useCallback((nextStats, didWin) => {
    setStats(nextStats);
    setWon(didWin);
    // Gate results on lead capture the first time, but don't pester returning players.
    if (!sessionStorage.getItem(LEAD_NO_KEY)) {
      setShowLeadModal(true);
    }
    setScreen('results');
  }, []);

  const handleWin = useCallback((s) => finishRound(s, true), [finishRound]);
  const handleLose = useCallback((s) => finishRound(s, false), [finishRound]);

  const handleRetry = useCallback(() => {
    if (won && levelIdx < LEVELS.length - 1) setLevelIdx((i) => i + 1);
    setGameKey((k) => k + 1);
    setScreen('game');
  }, [won, levelIdx]);

  const handlePlayAgainFromThanks = useCallback(() => {
    setBookedDetails(null);
    setLevelIdx(0);
    setGameKey((k) => k + 1);
    setScreen('game');
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      maxWidth: 430,
      margin: '0 auto',
      overflow: 'hidden',
      background: '#000',
    }}>
      {screen === 'home' && (
        <HomeScreen onStart={startGame} theme={THEME} levelLabel={`LVL ${level.id}`} />
      )}

      {screen === 'game' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: THEME.gameBg,
          display: 'flex', flexDirection: 'column',
          padding: '32px 0 0',
        }}>
          <div style={{
            padding: '6px 14px 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'white',
          }}>
            <button onClick={goHome} aria-label="Back" style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              width: 32, height: 32, borderRadius: '50%', color: 'white',
              fontSize: 16, cursor: 'pointer',
            }}>←</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.6, letterSpacing: '0.1em' }}>LEVEL {level.id}</div>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 900, color: 'var(--brand-gold)', lineHeight: 1 }}>
                {level.name}
              </div>
            </div>
            <div style={{ width: 32 }} />
          </div>

          <div style={{ padding: '4px 8px 0', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <BubbleShooter
              key={gameKey}
              level={level}
              onWin={handleWin}
              onLose={handleLose}
            />
          </div>

          <div style={{
            padding: '8px 16px 12px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 10, textAlign: 'center', fontWeight: 600,
          }}>
            👆 Drag to aim · Release to shoot · Match 3+ same colour
          </div>
        </div>
      )}

      {screen === 'results' && (
        <ResultsScreen
          stats={stats}
          won={won}
          onRetry={handleRetry}
          onHome={goHome}
          onBookSlot={() => setShowSlotModal(true)}
          retryLabel={won && levelIdx < LEVELS.length - 1 ? `Play Level ${LEVELS[levelIdx + 1].id} →` : (won ? 'Play again' : 'Try again')}
        />
      )}

      {screen === 'thankyou' && (
        <ThankYouScreen
          details={bookedDetails}
          onPlayAgain={handlePlayAgainFromThanks}
          onHome={goHome}
        />
      )}

      {showLeadModal && (
        <LeadCaptureModal
          score={stats.score}
          onSubmitted={() => setShowLeadModal(false)}
          onSkip={() => setShowLeadModal(false)}
        />
      )}

      {showSlotModal && (
        <SlotBookingModal
          score={stats.score}
          onConfirmed={(details) => {
            setShowSlotModal(false);
            setBookedDetails(details);
            setScreen('thankyou');
          }}
          onSkip={() => setShowSlotModal(false)}
        />
      )}
    </div>
  );
}
