import React from 'react';

const TetrisLayout = ({ children }) => {
    return (
        <div className="h-full w-full bg-[#050510] text-slate-800 flex flex-col items-center justify-center overflow-hidden relative font-sans">
            {/* Mobile Frame Container */}
            <div className="relative w-full h-full sm:h-[90vh] sm:aspect-[9/16] sm:max-w-md bg-[#050510] sm:rounded-[2.5rem] sm:shadow-[0_20px_50px_rgba(0,0,0,0.8)] sm:border-[12px] sm:border-[#1e293b] overflow-hidden z-10 flex flex-col items-center">
                <div className="w-full h-full relative flex flex-col items-center overflow-hidden">
                    {children}
                </div>
            </div>

            {/* Background Decorative Elements for Desktop */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            </div>
        </div>
    );
};

export default TetrisLayout;
