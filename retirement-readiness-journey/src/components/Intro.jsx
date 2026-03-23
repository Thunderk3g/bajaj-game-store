import React from 'react';
import { Button } from './ui/Button';

/**
 * Intro screen for the Retirement Readiness Journey.
 * Lead capture moved to post-assessment.
 */
const Intro = ({ onStart }) => {
    const handleStartClick = () => {
        onStart();
    };

    return (
        <div
            className="flex-1 flex flex-col items-center justify-end text-center animate-in fade-in duration-700 w-full"
            style={{
                backgroundImage: `url('./assets/Intro.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="w-full flex justify-center pb-12 sm:pb-16 px-6">
                <Button
                    onClick={handleStartClick}
                    className="w-full max-w-[320px] h-14 sm:h-[4rem] text-[1.1rem] sm:text-[1.25rem] font-black text-white rounded-none tracking-widest hover:opacity-100 transition-all border-b-[6px] border-[#00407A] active:border-b-0 active:translate-y-[6px] relative overflow-hidden group shadow-[0_10px_30px_rgba(0,102,178,0.3)]"
                    style={{ background: '#0066B2' }}
                >
                    <span className="relative z-10 italic">START NOW</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
            </div>
        </div>
    );
};

export default Intro;
