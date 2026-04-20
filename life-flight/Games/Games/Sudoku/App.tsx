
import React, { useState } from 'react';
import { GameState, LeadData } from './types';
import StartScreen from './components/StartScreen';
import SudokuPuzzle from './components/SudokuPuzzle';
import RetirementReveal from './components/RetirementReveal';
import EducationScreen from './components/EducationScreen';
import LeadForm from './components/LeadForm';
import SuccessScreen from './components/SuccessScreen';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [leadInfo, setLeadInfo] = useState<LeadData | null>(null);

  const startGame = () => {
    setGameState(GameState.PUZZLE);
  };

  const finishGame = () => {
    setGameState(GameState.RETIREMENT_REVEAL);
  };

  const proceedToEducation = () => setGameState(GameState.EDUCATIONAL);
  const proceedToLeadGen = () => setGameState(GameState.LEAD_GEN);
  const handleLeadSubmit = (data: LeadData) => {
    setLeadInfo(data);
    setGameState(GameState.SUCCESS);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-white shadow-2xl flex flex-col">
      {gameState === GameState.START && (
        <StartScreen onStart={startGame} />
      )}
      
      {gameState === GameState.PUZZLE && (
        <SudokuPuzzle onComplete={finishGame} />
      )}
      
      {gameState === GameState.RETIREMENT_REVEAL && (
        <RetirementReveal score={5000000} onNext={proceedToEducation} />
      )}
      
      {gameState === GameState.EDUCATIONAL && (
        <EducationScreen onNext={proceedToLeadGen} />
      )}
      
      {gameState === GameState.LEAD_GEN && (
        <LeadForm onSubmit={handleLeadSubmit} />
      )}
      
      {gameState === GameState.SUCCESS && (
        <SuccessScreen name={leadInfo?.fullName || 'there'} />
      )}
    </div>
  );
};

export default App;
