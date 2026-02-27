import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw } from "lucide-react";

const ThankYouScreen = ({ leadName, onRestart }) => {
    return (
        <motion.div
            className="w-full h-full flex flex-col items-center justify-between py-10 px-6 text-center overflow-hidden bg-slate-950"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex-1 flex flex-col justify-center space-y-10 min-h-0 w-full max-w-sm">
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="flex justify-center"
                >
                    <div className="bg-blue-600 p-6 rounded-full shadow-2xl relative">
                        <div className="absolute inset-0 bg-blue-600/30 rounded-full animate-ping" />
                        <CheckCircle2 className="w-20 h-20 text-white relative z-10" strokeWidth={2.5} />
                    </div>
                </motion.div>

                {/* Thank You Message */}
                <div className="space-y-4 px-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-[1.1] flex flex-col items-center gap-1">
                        <span>THANK YOU</span>
                        <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] break-words max-w-full italic px-2">{leadName ? leadName : ''}</span>
                        <span className="text-center">FOR SHARING YOUR DETAILS</span>
                    </h2>
                    <p className="text-base text-gray-500 font-bold uppercase tracking-wide max-w-[280px] mx-auto leading-relaxed">
                        Our Relationship Manager will reach out to you
                    </p>
                </div>
            </div>

            {/* Action Section */}
            <div className="w-full max-w-sm pt-4 pb-2 text-center">
                <button
                    onClick={onRestart}
                    className="w-full bg-slate-800 text-white font-black text-2xl py-5 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-700 transition-all active:scale-95 shadow-lg border-b-4 border-slate-900"
                >
                    <RotateCcw className="w-8 h-8" />
                    <span>PLAY AGAIN</span>
                </button>
            </div>
        </motion.div>
    );
};

export default ThankYouScreen;
