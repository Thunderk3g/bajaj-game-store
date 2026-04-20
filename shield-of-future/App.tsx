import React, { useState, useCallback } from 'react';
import { GameState, LeadData } from './types';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import SummaryScreen from './components/SummaryScreen';
import LeadFormScreen from './components/LeadFormScreen';
import SuccessScreen from './components/SuccessScreen';
import SlotBooking from './components/SlotBooking';
import { submitToLMS } from './utils/api';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [score, setScore] = useState<number>(0);
  const [leads, setLeads] = useState<LeadData | null>(null);
  const [leadNo, setLeadNo] = useState<string | null>(null);
  const [showSlotBooking, setShowSlotBooking] = useState(false);

  const startGame = useCallback(() => setGameState(GameState.PLAYING), []);
  const finishGame = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.SUMMARY);
  }, []);
  const goToForm = useCallback(() => setGameState(GameState.FORM), []);

  const handleFormSubmit = useCallback(async (data: LeadData) => {
    setLeads(data);
    const result = await submitToLMS({
      name: data.fullName,
      mobile_no: data.mobile,
      score,
      summary_dtls: 'Shield of Future Lead',
    });
    const returnedLeadNo = (result.leadNo || result.LeadNo || null) as string | null;
    if (returnedLeadNo) {
      setLeadNo(returnedLeadNo);
      sessionStorage.setItem('shieldOfFutureLeadNo', returnedLeadNo);
    }
    setShowSlotBooking(true);
  }, [score]);

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
        {showSlotBooking && leads && (
          <SlotBooking
            leadNo={leadNo}
            name={leads.fullName}
            mobile={leads.mobile}
            remarks="Slot Booking via Shield of Future"
            onComplete={() => {
              setShowSlotBooking(false);
              setGameState(GameState.SUCCESS);
            }}
            onSkip={() => {
              setShowSlotBooking(false);
              setGameState(GameState.SUCCESS);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
