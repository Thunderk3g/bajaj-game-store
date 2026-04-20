
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, WordData, UserLead } from './types';
import { GAME_WORDS, MAX_ATTEMPTS } from './constants';
import GameEngine from './components/GameEngine';
import LeadCapture from './components/LeadCapture';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [aiMessage, setAiMessage] = useState<string>("");

  // Use Gemini to generate a personalized tip for the user
  const fetchAiTip = async (userName?: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a 1-sentence supportive tip about why child insurance is a must for Indian parents${userName ? ` addressed to ${userName}` : ''}. Keep it professional and warm. Include the rupee symbol ₹ where relevant for financial context.`,
      });
      setAiMessage(response.text || "Secure your child's future today with a plan that grows with them.");
    } catch (error) {
      setAiMessage("Every step you take today ensures a brighter tomorrow for your little one.");
    }
  };

  useEffect(() => {
    fetchAiTip();
  }, []);

  const handleStartGame = () => {
    setGameState(GameState.PLAYING);
  };

  const handleGameEnd = (won: boolean) => {
    if (won) {
      setScore(prev => prev + 1);
      if (currentWordIndex < GAME_WORDS.length - 1) {
        setGameState(GameState.WON);
      } else {
        setGameState(GameState.LEAD_FORM);
      }
    } else {
      setGameState(GameState.LOST);
    }
  };

  const nextLevel = () => {
    setCurrentWordIndex(prev => prev + 1);
    setGameState(GameState.PLAYING);
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  const handleLeadSubmit = async (lead: UserLead) => {
    // Re-fetch AI tip with user's name
    await fetchAiTip(lead.fullName);
    setGameState(GameState.SUCCESS);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative border border-slate-100 min-h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="bg-indigo-700 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">FutureGuard</h1>
          <p className="text-indigo-200 text-sm">Secure Their Dreams, Piece by Piece</p>
        </div>

        {/* Dynamic Content */}
        <div className="flex-grow p-6 flex flex-col items-center justify-center">
          {gameState === GameState.START && (
            <div className="text-center space-y-6">
              <div className="w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <img 
                  src="https://picsum.photos/seed/child/200/200" 
                  alt="Child Future" 
                  className="w-40 h-40 rounded-full object-cover shadow-lg"
                />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Can you unlock your child's future?</h2>
              <p className="text-slate-600">Solve the word puzzles to learn how our Child Plan helps you save for education, marriage, and more.</p>
              <button 
                onClick={handleStartGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Start Challenge
              </button>
            </div>
          )}

          {gameState === GameState.PLAYING && (
            <GameEngine 
              wordData={GAME_WORDS[currentWordIndex]} 
              onEnd={handleGameEnd}
              currentLevel={currentWordIndex + 1}
              totalLevels={GAME_WORDS.length}
            />
          )}

          {gameState === GameState.WON && (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600">Correct!</h2>
              <div className="bg-green-50 p-4 rounded-xl text-green-800 text-sm italic">
                "{GAME_WORDS[currentWordIndex].fact}"
              </div>
              <p className="text-slate-600">You're one step closer to securing their future.</p>
              <button 
                onClick={nextLevel}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Next Word
              </button>
            </div>
          )}

          {gameState === GameState.LOST && (
            <div className="text-center space-y-4">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="text-2xl font-bold text-slate-800">Don't lose hope!</h2>
              <p className="text-slate-600">Planning for the future can be tricky. Every parent needs a safety net.</p>
              <div className="bg-amber-50 p-4 rounded-xl text-amber-800 text-sm italic">
                The word was: <span className="font-bold">{GAME_WORDS[currentWordIndex].word}</span>
              </div>
              <button 
                onClick={restartGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Try Again
              </button>
            </div>
          )}

          {gameState === GameState.LEAD_FORM && (
            <LeadCapture onSubmit={handleLeadSubmit} />
          )}

          {gameState === GameState.SUCCESS && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Application Received!</h2>
              <p className="text-slate-600">Our senior advisor will call you shortly to discuss a tailored <strong>₹ Investment Plan</strong> for your child.</p>
              
              {aiMessage && (
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900 text-sm italic animate-fade-in">
                  "{aiMessage}"
                </div>
              )}

              <div className="pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Key Benefits Shared</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {GAME_WORDS.map(w => (
                    <span key={w.word} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 text-center text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100">
          *Insurance is a subject matter of solicitation. T&C Apply.
        </div>
      </div>
    </div>
  );
};

export default App;
