import React from 'react';

const ScoreDisplay = ({ score, timeLeft, formatTime, nextPiece }) => {
    return (
        <div className="w-full grid grid-cols-3 gap-2 px-1 mb-4">
            {/* Timer Column */}
            <div className="bg-[#050530] border border-blue-900/50 p-2 flex flex-col items-center justify-center shadow-lg rounded-sm">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-blue-400 leading-tight">Time</label>
                <span className="text-xl font-black text-white leading-tight mt-0.5">{formatTime(timeLeft)}</span>
            </div>

            {/* Score Column */}
            <div className="bg-[#050530] border border-blue-900/50 p-2 flex flex-col items-center justify-center shadow-lg rounded-sm">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-blue-400 leading-tight text-center w-full">Milestones</label>
                <span className="text-xl font-black text-white leading-tight mt-0.5 truncate w-full px-1 text-center font-mono">
                    {score.toLocaleString()}
                </span>
            </div>

            {/* Next Column */}
            <div className="bg-[#050530] border border-blue-900/50 p-2 flex flex-col items-center justify-center shadow-lg rounded-sm">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-blue-400 mb-1 leading-tight">Next</label>
                <div className="relative w-12 h-10 flex items-center justify-center">
                    {nextPiece && (
                        <div className="relative" style={{ width: `${nextPiece.shape[0].length * 10}px`, height: `${nextPiece.shape.length * 10}px` }}>
                            {nextPiece.shape.map((row, y) =>
                                row.map((val, x) => {
                                    if (val !== 0) {
                                        return (
                                            <div
                                                key={`${x}-${y}`}
                                                className={`absolute w-2.5 h-2.5 bg-${nextPiece.color} border border-white/20 rounded-[1px] shadow-sm`}
                                                style={{
                                                    left: `${x * 10}px`,
                                                    top: `${y * 10}px`
                                                }}
                                            />
                                        )
                                    }
                                    return null;
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreDisplay;
