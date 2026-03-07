import React from 'react';
import { motion } from 'framer-motion';

const ThankYouScreen = ({ leadName }) => {
    const rawName = (leadName || 'Player').trim();
    const firstName = rawName.split(/\s+/)[0];
    const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #00509E 0%, #003366 100%)' }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                    <h1 className="text-4xl sm:text-5xl font-black text-white italic tracking-tight drop-shadow-xl mb-4 leading-tight uppercase">
                        Thank You <br />
                        <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{displayName}!</span>
                    </h1>

                    <p className="text-base sm:text-lg text-blue-200 font-bold drop-shadow-md mb-2 tracking-wide italic text-center">
                        "Because protecting the ones you love<br />
                        is the smartest decision you'll ever make."
                    </p>

                    <div className="h-px w-12 bg-white/20 my-6 mx-auto" />

                    <p className="text-sm sm:text-base text-white/90 font-medium mb-1 tracking-wide">
                        For sharing your details
                    </p>
                    <p className="text-xs sm:text-sm text-blue-300 font-bold uppercase tracking-widest opacity-80">
                        Our Relationship Manager will connect with you
                    </p>
                </motion.div>
            </div>

            {/* Bottom Branding */}
            <p className="absolute bottom-8 left-0 right-0 text-white/20 text-[10px] font-black uppercase tracking-[0.3em] font-sans">
                Bajaj Life Insurance
            </p>
        </motion.div>
    );
};

export default ThankYouScreen;
