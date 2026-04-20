
import React, { useState, useEffect } from 'react';
import { PuzzleCell, PuzzleSymbol } from '../types';

interface Props {
  onComplete: () => void;
}

const SYMBOLS: PuzzleSymbol[] = ['₹', '🏠', '📜', '💼'];

const SudokuPuzzle: React.FC<Props> = ({ onComplete }) => {
  // 4x4 Valid Grid Example
  // 1 2 3 4 -> ₹ 🏠 📜 💼
  // 3 4 1 2 -> 📜 💼 ₹ 🏠
  // 2 1 4 3 -> 🏠 ₹ 💼 📜
  // 4 3 2 1 -> 💼 📜 🏠 ₹
  
  const initialGrid: PuzzleCell[][] = [
    [
      { value: '₹', isInitial: true, correctValue: '₹' },
      { value: null, isInitial: false, correctValue: '🏠' },
      { value: '📜', isInitial: true, correctValue: '📜' },
      { value: null, isInitial: false, correctValue: '💼' },
    ],
    [
      { value: '📜', isInitial: true, correctValue: '📜' },
      { value: '💼', isInitial: true, correctValue: '💼' },
      { value: null, isInitial: false, correctValue: '₹' },
      { value: '🏠', isInitial: true, correctValue: '🏠' },
    ],
    [
      { value: null, isInitial: false, correctValue: '🏠' },
      { value: '₹', isInitial: true, correctValue: '₹' },
      { value: '💼', isInitial: true, correctValue: '💼' },
      { value: null, isInitial: false, correctValue: '📜' },
    ],
    [
      { value: '💼', isInitial: true, correctValue: '💼' },
      { value: null, isInitial: false, correctValue: '📜' },
      { value: '🏠', isInitial: true, correctValue: '🏠' },
      { value: '₹', isInitial: true, correctValue: '₹' },
    ],
  ];

  const [grid, setGrid] = useState<PuzzleCell[][]>(initialGrid);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isInitial || isSuccess) return;
    setSelectedCell([row, col]);
  };

  const handleSymbolSelect = (symbol: PuzzleSymbol) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    
    const newGrid = [...grid];
    newGrid[row][col].value = symbol;
    setGrid(newGrid);
    setSelectedCell(null);

    // Check for success
    const allFilled = newGrid.every(r => r.every(c => c.value !== null));
    if (allFilled) {
      const isCorrect = newGrid.every(r => r.every(c => c.value === c.correctValue));
      if (isCorrect) {
        setIsSuccess(true);
        setTimeout(onComplete, 1500);
      } else {
        setError("Something is out of balance. Check your rows and columns!");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white p-6 justify-center items-center">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-extrabold text-slate-900 mb-1 uppercase tracking-tight">Retirement Planner</h2>
        <p className="text-sm text-slate-500 font-medium">Balance the 4 key assets of your future</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-[320px] aspect-square bg-slate-100 p-2 rounded-2xl border-4 border-slate-200">
        {grid.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-200
                  ${cell.isInitial ? 'bg-slate-200 text-slate-800' : 'bg-white shadow-sm hover:shadow-md'}
                  ${isSelected ? 'ring-4 ring-blue-500 scale-105 z-10' : ''}
                  ${isSuccess ? 'bg-green-100 text-green-600 scale-95 opacity-80' : ''}
                `}
              >
                {cell.value}
              </button>
            );
          })
        )}
      </div>

      {/* Symbol Picker */}
      <div className="mt-10 w-full max-w-[320px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Select Asset to Place</p>
        <div className="flex justify-between gap-2">
          {SYMBOLS.map(symbol => (
            <button
              key={symbol}
              onClick={() => handleSymbolSelect(symbol)}
              disabled={!selectedCell || isSuccess}
              className={`
                flex-1 aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl shadow-sm
                active:scale-90 transition-all
                ${!selectedCell ? 'bg-slate-50 border-slate-100 opacity-50' : 'bg-white border-blue-100 hover:border-blue-400 text-blue-600'}
              `}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Area */}
      <div className="mt-8 h-12 flex items-center justify-center w-full">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-bold animate-pulse border border-red-100">
            {error}
          </div>
        )}
        {isSuccess && (
          <div className="bg-green-50 text-green-600 px-6 py-3 rounded-full text-lg font-black animate-bounce border border-green-100">
            PERFECTLY BALANCED! ✨
          </div>
        )}
        {!error && !isSuccess && (
          <p className="text-slate-400 text-sm italic font-medium">Tap an empty cell then pick an icon</p>
        )}
      </div>

      {/* Asset Legend */}
      <div className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
        <div className="flex items-center gap-1"><span>₹</span> Savings</div>
        <div className="flex items-center gap-1"><span>🏠</span> Property</div>
        <div className="flex items-center gap-1"><span>📜</span> Insurance</div>
        <div className="flex items-center gap-1"><span>💼</span> Income</div>
      </div>
    </div>
  );
};

export default SudokuPuzzle;
