import React, { useCallback, useEffect, useState } from 'react';
import { applyConfig } from './constants';
import { GameResult, PlayerInfo, Screen } from './types';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import EnterDetailsScreen from './components/EnterDetailsScreen';
import ScoringScreen from './components/ScoringScreen';
import ThankYouScreen from './components/ThankYouScreen';

const App: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState(Screen.INTRO);
  const [result, setResult] = useState<GameResult | null>(null);
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

  const handleGameEnd = useCallback((nextResult: GameResult) => {
    setResult(nextResult);
    setScreen(Screen.DETAILS);
  }, []);

  const handleDetailsSubmit = useCallback((info: PlayerInfo) => {
    setPlayer(info);
    setScreen(Screen.SCORING);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setResult(null);
    setScreen(Screen.INTRO);
  }, []);

  if (!ready) return null;

  return (
    <div className="game-wrap">
      {screen === Screen.INTRO && <IntroScreen onPlay={() => setScreen(Screen.GAME)} />}
      {screen === Screen.GAME && <GameScreen onGameEnd={handleGameEnd} />}
      {screen === Screen.DETAILS && <EnterDetailsScreen onSubmit={handleDetailsSubmit} result={result} />}
      {screen === Screen.SCORING && result && (
        <ScoringScreen
          result={result}
          player={player}
          onBookComplete={() => setScreen(Screen.THANK_YOU)}
          onPlayAgain={handlePlayAgain}
        />
      )}
      {screen === Screen.THANK_YOU && <ThankYouScreen name={player.name} onPlayAgain={handlePlayAgain} />}
    </div>
  );
};

export default App;
