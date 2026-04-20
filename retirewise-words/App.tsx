import React, { useState } from 'react';
import { GameState, LeadData } from './types';
import StartScreen from './components/StartScreen';
import WordChallenge from './components/WordChallenge';
import RetirementReveal from './components/RetirementReveal';
import EducationScreen from './components/EducationScreen';
import LeadForm from './components/LeadForm';
import SuccessScreen from './components/SuccessScreen';
import SlotBooking from './components/SlotBooking';
import { submitToLMS } from './utils/api';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [leadInfo, setLeadInfo] = useState<LeadData | null>(null);
  const [leadNo, setLeadNo] = useState<string | null>(null);
  const [showSlotBooking, setShowSlotBooking] = useState(false);

  const startGame = () => setGameState(GameState.WORD_CHALLENGE);
  const finishGame = () => setGameState(GameState.RETIREMENT_REVEAL);
  const proceedToEducation = () => setGameState(GameState.EDUCATIONAL);
  const proceedToLeadGen = () => setGameState(GameState.LEAD_GEN);

  const handleLeadSubmit = async (data: LeadData) => {
    setLeadInfo(data);
    const result = await submitToLMS({
      name: data.fullName,
      mobile_no: data.mobile,
      summary_dtls: 'RetireWise Words Lead',
    });
    const returnedLeadNo = (result.leadNo || result.LeadNo || null) as string | null;
    if (returnedLeadNo) {
      setLeadNo(returnedLeadNo);
      sessionStorage.setItem('retirewiseWordsLeadNo', returnedLeadNo);
    }
    setShowSlotBooking(true);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto relative overflow-hidden bg-white shadow-2xl flex flex-col">
      {gameState === GameState.START && <StartScreen onStart={startGame} />}
      {gameState === GameState.WORD_CHALLENGE && <WordChallenge onComplete={finishGame} />}
      {gameState === GameState.RETIREMENT_REVEAL && (
        <RetirementReveal score={5000000} onNext={proceedToEducation} />
      )}
      {gameState === GameState.EDUCATIONAL && <EducationScreen onNext={proceedToLeadGen} />}
      {gameState === GameState.LEAD_GEN && <LeadForm onSubmit={handleLeadSubmit} />}
      {gameState === GameState.SUCCESS && (
        <SuccessScreen name={leadInfo?.fullName || 'there'} />
      )}

      {showSlotBooking && leadInfo && (
        <SlotBooking
          leadNo={leadNo}
          name={leadInfo.fullName}
          mobile={leadInfo.mobile}
          remarks="Slot Booking via RetireWise Words"
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
  );
};

export default App;
