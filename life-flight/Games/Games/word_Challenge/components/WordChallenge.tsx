
import React, { useState, useEffect } from 'react';
import { WordStage } from '../types';

interface Props {
  onComplete: () => void;
}

const STAGES: WordStage[] = [
  {
    answer: 'ANNUITY',
    scrambled: 'UITYANN',
    hint: 'A one-time payment for lifelong guaranteed income.'
  },
  {
    answer: 'INCOME',
    scrambled: 'OMENIC',
    hint: 'The regular monthly money you receive in retirement.'
  },
  {
    answer: 'RETIRE',
    scrambled: 'ERITER',
    hint: 'When you stop working but life keeps moving forward.'
  }
];

const WordChallenge: React.FC<Props> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    resetStage(currentStage);
  }, [currentStage]);

  const resetStage = (index: number) => {
    const letters = STAGES[index].scrambled.split('');
    setAvailableLetters(letters);
    setUserAnswer(new Array(STAGES[index].answer.length).fill(''));
    setIsCorrect(false);
  };

  const handleLetterClick = (letter: string, index: number) => {
    if (isCorrect) return;

    // Find first empty slot in userAnswer
    const emptyIndex = userAnswer.indexOf('');
    if (emptyIndex !== -1) {
      const newUserAnswer = [...userAnswer];
      newUserAnswer[emptyIndex] = letter;
      setUserAnswer(newUserAnswer);

      // Remove from available
      const newAvailable = [...availableLetters];
      newAvailable.splice(index, 1);
      setAvailableLetters(newAvailable);

      // Check if word is complete
      if (newUserAnswer.every(l => l !== '')) {
        if (newUserAnswer.join('') === STAGES[currentStage].answer) {
          setIsCorrect(true);
          setTimeout(() => {
            if (currentStage < STAGES.length - 1) {
              setCurrentStage(prev => prev + 1);
            } else {
              onComplete();
            }
          }, 1000);
        } else {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          // Auto-clear on wrong answer for smooth mobile play
          setTimeout(() => resetStage(currentStage), 600);
        }
      }
    }
  };

  const handleAnswerSlotClick = (index: number) => {
    if (isCorrect || userAnswer[index] === '') return;

    const letter = userAnswer[index];
    const newUserAnswer = [...userAnswer];
    newUserAnswer[index] = '';
    setUserAnswer(newUserAnswer);

    setAvailableLetters(prev => [...prev, letter]);
  };

  const stage = STAGES[currentStage];

  return (
    <div className="flex-1 flex flex-col bg-white p-6 items-center justify-between">
      <div className="w-full pt-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-1">
            {STAGES.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-12 rounded-full transition-all duration-500 ${i <= currentStage ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-400">STEP {currentStage + 1}/3</span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Unscramble the Word</h2>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 min-h-[80px] flex items-center justify-center">
            <p className="text-slate-600 text-sm italic">"{stage.hint}"</p>
          </div>
        </div>
      </div>

      <div className={`flex flex-wrap justify-center gap-2 mb-12 ${shake ? 'animate-shake' : ''}`}>
        {userAnswer.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleAnswerSlotClick(i)}
            className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all
              ${letter === '' ? 'border-dashed border-slate-300 bg-slate-50' : 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'}
              ${isCorrect ? 'bg-green-500 border-green-500 text-white' : ''}
            `}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="w-full pb-8">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tap to Place Letters</p>
        <div className="flex flex-wrap justify-center gap-3">
          {availableLetters.map((letter, i) => (
            <button
              key={i}
              onClick={() => handleLetterClick(letter, i)}
              className="w-12 h-14 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center text-2xl font-black text-slate-700 shadow-sm active:scale-90 active:bg-slate-100 transition-all"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default WordChallenge;
