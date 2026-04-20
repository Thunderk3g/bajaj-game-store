
import React, { useState, useCallback } from 'react';
import { GameState, LeadData } from './types';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import SummaryScreen from './components/SummaryScreen';
import LeadFormScreen from './components/LeadFormScreen';
import SuccessScreen from './components/SuccessScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [score, setScore] = useState<number>(0);
  const [leads, setLeads] = useState<LeadData | null>(null);

  const startGame = useCallback(() => setGameState(GameState.PLAYING), []);
  const finishGame = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.SUMMARY);
  }, []);
  
  const goToForm = useCallback(() => setGameState(GameState.FORM), []);
  
  const handleFormSubmit = useCallback((data: LeadData) => {
    setLeads(data);
    setGameState(GameState.SUCCESS);
  }, []);

  const renderScreen = () => {
    switch (gameState) {
      case GameState.INTRO:
        return <IntroScreen onStart={startGame} />;
      case GameState.PLAYING:
        return <GameScreen onFinish={finishGame} />;
      case GameState.SUMMARY:
        return <SummaryScreen score={score} onContinue={goToForm} />;
      case GameState.FORM:
        return <LeadFormScreen onSubmit={handleFormSubmit} />;
      case GameState.SUCCESS:
        return <SuccessScreen />;
      default:
        return <IntroScreen onStart={startGame} />;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md h-full bg-white shadow-2xl relative flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
