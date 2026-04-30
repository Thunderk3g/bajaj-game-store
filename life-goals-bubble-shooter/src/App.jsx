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
  homeBg: 'linear-gradient(180deg, #003366 0%, #00509E 50%, #00224B 100%)',
  gameBg: 'linear-gradient(180deg, #051a3a 0%, #0e4f94 50%, #051a3a 100%)',
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
    setScreen('results');
  }, []);

  const handleBookSlot = useCallback(() => {
    if (!sessionStorage.getItem(LEAD_NO_KEY)) {
      setShowLeadModal(true);
    } else {
      setShowSlotModal(true);
    }
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
      background: '#00102A',
    }}>
      {screen === 'home' && (
        <HomeScreen onStart={startGame} theme={THEME} levelLabel={`LVL ${level.id}`} />
      )}

      {screen === 'game' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: THEME.gameBg,
          display: 'flex', flexDirection: 'column',
          padding: '14px 0 8px',
        }}>
          <div style={{
            padding: '4px 14px 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'white',
          }}>
            <button onClick={goHome} aria-label="Back" style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              width: 34, height: 34, borderRadius: '50%', color: 'white',
              fontSize: 16, cursor: 'pointer', fontWeight: 800,
            }}>←</button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div className="hud-label">
                Level {level.id} · {level.subtitle}
              </div>
              <div className="ls-display" style={{
                fontSize: 16, fontWeight: 900, color: '#FFD37A', lineHeight: 1.1, marginTop: 1,
              }}>
                {level.name}
              </div>
            </div>
            <div className="ls-chip" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 4,
                background: 'linear-gradient(135deg, var(--ls-blue) 0%, var(--ls-orange) 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset',
              }} />
              <span style={{
                fontSize: 9, fontWeight: 800, color: 'var(--ls-white)',
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>Bajaj Life</span>
            </div>
          </div>

          <div style={{ padding: '0 8px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <BubbleShooter
              key={gameKey}
              level={level}
              onWin={handleWin}
              onLose={handleLose}
            />
          </div>

          <div className="tap-hint-label" style={{
            padding: '6px 16px 6px', textAlign: 'center',
          }}>
            👆 Drag inside the board to aim · release to fire
          </div>
        </div>
      )}

      {screen === 'results' && (
        <ResultsScreen
          stats={stats}
          won={won}
          onRetry={handleRetry}
          onHome={goHome}
          onBookSlot={handleBookSlot}
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
          onSubmitted={() => { setShowLeadModal(false); setShowSlotModal(true); }}
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
