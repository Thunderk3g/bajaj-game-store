import React, { useCallback, useEffect, useState } from 'react';
import { GameResult, PlayerInfo, Screen } from './types';
import { applyConfig } from './constants';
import IntroScreen from './components/IntroScreen';
import HowToPlayScreen from './components/HowToPlayScreen';
import GameScreen from './components/GameScreen';
import EnterDetailsScreen from './components/EnterDetailsScreen';
import ScoringScreen from './components/ScoringScreen';
import ThankYouScreen from './components/ThankYouScreen';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>(Screen.INTRO);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [player, setPlayer] = useState<PlayerInfo>({ name: '', mobile: '' });

  useEffect(() => {
    fetch('./game.configuration.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((cfg) => {
        applyConfig(cfg);
        setReady(true);
      })
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
    setPlayer({ name: '', mobile: '' });
    setScreen(Screen.INTRO);
  }, []);

  if (!ready) return null;

  return (
    <div className="game-wrap">
      {screen === Screen.INTRO && <IntroScreen onPlay={() => setScreen(Screen.HOW_TO_PLAY)} />}
      {screen === Screen.HOW_TO_PLAY && <HowToPlayScreen onStart={() => setScreen(Screen.GAME)} />}
      {screen === Screen.GAME && <GameScreen onGameEnd={handleGameEnd} />}
      {screen === Screen.DETAILS && <EnterDetailsScreen onSubmit={handleDetailsSubmit} />}
      {screen === Screen.SCORING && gameResult && (
        <ScoringScreen
          result={gameResult}
          playerName={player.name}
          playerMobile={player.mobile}
          onBookComplete={() => setScreen(Screen.THANK_YOU)}
          onPlayAgain={handlePlayAgain}
        />
      )}
      {screen === Screen.THANK_YOU && <ThankYouScreen playerName={player.name} onPlayAgain={handlePlayAgain} />}
    </div>
  );
};

export default App;
