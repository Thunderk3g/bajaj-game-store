
import React, { useState, useEffect } from 'react';
import { WordData } from '../types';
import { MAX_ATTEMPTS } from '../constants';

interface GameEngineProps {
  wordData: WordData;
  onEnd: (won: boolean) => void;
  currentLevel: number;
  totalLevels: number;
}

const GameEngine: React.FC<GameEngineProps> = ({ wordData, onEnd, currentLevel, totalLevels }) => {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);

  const word = wordData.word.toUpperCase();
  const letters = word.split('');
  const isWon = letters.every(letter => guessedLetters.has(letter));
  const isLost = wrongCount >= MAX_ATTEMPTS;

  useEffect(() => {
    if (isWon) {
      setTimeout(() => onEnd(true), 500);
    } else if (isLost) {
      setTimeout(() => onEnd(false), 500);
    }
  }, [isWon, isLost, onEnd]);

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter) || isWon || isLost) return;

    setGuessedLetters(prev => new Set(prev).add(letter));
    if (!word.includes(letter)) {
      setWrongCount(prev => prev + 1);
    }
  };

  const keyboard = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Progress */}
      <div className="w-full flex justify-between items-center px-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Level {currentLevel}/{totalLevels}</span>
        <div className="flex space-x-1">
          {[...Array(MAX_ATTEMPTS)].map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-4 rounded-full transition-colors ${i < (MAX_ATTEMPTS - wrongCount) ? 'bg-indigo-500' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      {/* Visual Metaphor: The Future Shield */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-indigo-50 rounded-2xl border-2 border-dashed border-indigo-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
           <svg className="w-40 h-40 text-indigo-900" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
           </svg>
        </div>
        
        {/* The Word Display */}
        <div className="flex flex-wrap justify-center gap-2 px-4 z-10">
          {letters.map((letter, idx) => (
            <div 
              key={idx}
              className={`w-8 h-10 md:w-10 md:h-12 border-b-4 flex items-center justify-center text-xl md:text-2xl font-bold transition-all
                ${guessedLetters.has(letter) ? 'border-indigo-600 text-indigo-700' : 'border-slate-300 text-transparent'}`}
            >
              {guessedLetters.has(letter) ? letter : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Hint Area */}
      <div className="text-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Hint</p>
        <p className="text-slate-700 font-medium italic">"{wordData.hint}"</p>
      </div>

      {/* Virtual Keyboard */}
      <div className="grid grid-cols-7 gap-1.5 w-full">
        {keyboard.map(letter => {
          const isGuessed = guessedLetters.has(letter);
          const isCorrect = isGuessed && word.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);

          return (
            <button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed || isWon || isLost}
              className={`
                h-10 rounded-lg font-bold text-sm transition-all active:scale-90
                ${isCorrect ? 'bg-green-500 text-white shadow-md' : ''}
                ${isWrong ? 'bg-slate-200 text-slate-400' : ''}
                ${!isGuessed ? 'bg-white border-2 border-slate-100 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm' : ''}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GameEngine;
