import React, { useState, useCallback } from 'react';
import { Screen, GameResult, PlayerInfo } from './types';
import { MAX_LIVES, TOTAL_BRICKS } from './constants';
import { submitToLMS } from './utils/api';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import EnterDetailsScreen from './components/EnterDetailsScreen';
import ScoringScreen from './components/ScoringScreen';

function computeFinalScore(result: GameResult): number {
  const coverage   = Math.round((result.bricksCleared / TOTAL_BRICKS) * 100);
  const livesBonus = Math.round((result.livesRemaining / MAX_LIVES) * 20);
  return Math.min(100, Math.round(coverage * 0.8 + livesBonus));
}

const App: React.FC = () => {
  const [screen,     setScreen]     = useState<Screen>(Screen.INTRO);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [player,     setPlayer]     = useState<PlayerInfo>({ name: '', mobile: '' });
  const [leadNo,     setLeadNo]     = useState<string | null>(null);

  const handleGameEnd = useCallback((result: GameResult) => {
    setGameResult(result);
    setScreen(Screen.DETAILS);
  }, []);

  const handleDetailsSubmit = useCallback((info: PlayerInfo) => {
    setPlayer(info);
    setScreen(Screen.SCORING);

    const score = gameResult ? computeFinalScore(gameResult) : undefined;
    submitToLMS({
      name: info.name,
      mobile: info.mobile,
      score,
      summary_dtls: 'Health Shield Lead',
    })
      .then((res) => {
        const lead = (res.leadNo || res.LeadNo || '') as string;
        if (lead) {
          setLeadNo(lead);
          try { sessionStorage.setItem('healthShieldLeadNo', lead); } catch (_) { /* ignore */ }
        }
      })
      .catch((err) => {
        // Non-blocking: log and continue.
        // eslint-disable-next-line no-console
        console.error('submitToLMS failed', err);
      });
  }, [gameResult]);

  const handlePlayAgain = useCallback(() => {
    setGameResult(null);
    setLeadNo(null);
    setScreen(Screen.INTRO);
  }, []);

  return (
    <div className="game-wrap">
      {screen === Screen.INTRO   && <IntroScreen onPlay={() => setScreen(Screen.GAME)} />}
      {screen === Screen.GAME    && <GameScreen onGameEnd={handleGameEnd} />}
      {screen === Screen.DETAILS && <EnterDetailsScreen onSubmit={handleDetailsSubmit} />}
      {screen === Screen.SCORING && gameResult && (
        <ScoringScreen
          result={gameResult}
          playerName={player.name}
          playerMobile={player.mobile}
          leadNo={leadNo}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default App;
