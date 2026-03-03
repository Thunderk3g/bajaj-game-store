import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useGame } from '../context/GameContext.jsx';

export default function SuccessPage() {
    const { dispatch, ACTIONS } = useGame();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Retrieve name from session storage for prefill-like experience
        const name = sessionStorage.getItem('lastSubmittedName') || '';
        setUserName(name);
    }, []);

    const handleRestart = () => {
        dispatch({ type: ACTIONS.START_GAME });
        navigate('/game');
    };

    return (
        <motion.div
            className="w-full h-full flex flex-col justify-between py-10 px-6 text-center overflow-hidden relative"
            style={{ background: "linear-gradient(180deg, #00509E 0%, #003366 100%)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center opacity-40 mix-blend-overlay"
                style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)' }}>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center space-y-10 min-h-0">
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <div className="bg-[#2DC653] p-6 rounded-full shadow-[0_0_40px_rgba(45,198,83,0.6)] relative">
                        <div className="absolute inset-0 bg-[#2DC653]/30 rounded-full animate-ping" />
                        <CheckCircle2 className="w-20 h-20 text-white relative z-10" strokeWidth={2.5} />
                    </div>
                </motion.div>

                {/* Thank You Message */}
                <div className="space-y-5 px-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-[1.1] flex flex-col items-center">
                        <span className="opacity-90">THANK YOU</span>
                        <span className="text-[#00B4D8] drop-shadow-[0_0_15px_rgba(0,180,216,0.6)] my-1">
                            {userName || 'Friend'}
                        </span>
                        <span className="opacity-90">FOR SHARING YOUR DETAILS</span>
                    </h2>
                    <div className="w-12 h-1 bg-[#00B4D8]/30 mx-auto rounded-full"></div>
                    <p className="text-sm sm:text-base text-blue-100/70 font-bold uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed mb-6">
                        Our Relationship Manager will reach out to you shortly.
                    </p>

                    <div className="flex justify-center">
                        <button
                            onClick={handleRestart}
                            className="px-8 py-3 rounded-xl font-black text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg border-2 border-white/20"
                            style={{
                                fontSize: 13,
                                background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)'
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>TRY AGAIN</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
