import React, { useState, useCallback, useEffect } from 'react';
import { Screen, GameResult, PlayerInfo } from './types';
import { applyConfig } from './constants';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import EnterDetailsScreen from './components/EnterDetailsScreen';
import ScoringScreen from './components/ScoringScreen';

const App: React.FC = () => {
  const [ready,      setReady]      = useState(false);
  const [screen,     setScreen]     = useState<Screen>(Screen.INTRO);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [player,     setPlayer]     = useState<PlayerInfo>({ name: '', mobile: '' });

  useEffect(() => {
    fetch('./src/game.configuration.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(cfg => { applyConfig(cfg); setReady(true); })
      .catch(() => setReady(true));
  }, []);

  const handleGameEnd = useCallback((result: GameResult) => {
    setGameResult(result);
    setScreen(Screen.DETAILS);
  }, []);

  const handleDetailsSubmit = useCallback((info: PlayerInfo) => {
    setPlayer(info);
    setScreen(Screen.SCORING);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameResult(null);
    setScreen(Screen.INTRO);
  }, []);

  if (!ready) return null;

  return (
    <div className="game-wrap">
      {screen === Screen.INTRO   && <IntroScreen   onPlay={() => setScreen(Screen.GAME)} />}
      {screen === Screen.GAME    && <GameScreen     onGameEnd={handleGameEnd} />}
      {screen === Screen.DETAILS && <EnterDetailsScreen onSubmit={handleDetailsSubmit} />}
      {screen === Screen.SCORING && gameResult && (
        <ScoringScreen
          result={gameResult}
          playerName={player.name}
          playerMobile={player.mobile}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default App;
