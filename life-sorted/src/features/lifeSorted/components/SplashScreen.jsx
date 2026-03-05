import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/Button';

const SplashScreen = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-24 h-24 mb-8 relative"
            >
                <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative glass-panel rounded-3xl p-5 border-gold/30 flex items-center justify-center">
                    <Sparkles className="text-gold w-full h-full" />
                </div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-heading font-bold mb-4 tracking-tight"
            >
                Life <span className="text-gold">Sorted</span> 3D
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/60 mb-12 italic leading-relaxed"
            >
                "Life mixes many things. Clarity comes when you sort wisely."
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full space-y-4"
            >
                <div className="glass-panel p-4 mb-8 text-left border-white/5 bg-white/5">
                    <p className="text-xs uppercase tracking-widest text-teal font-bold mb-2">How to Play</p>
                    <ul className="text-sm text-white/70 space-y-2">
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                            <span>Tap a tube to select the top segment.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                            <span>Tap another tube to pour IF the top segment category matches OR the tube is empty.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                            <span>Sort all categories within 2 minutes per level.</span>
                        </li>
                    </ul>
                </div>

                <Button fullWidth size="lg" onClick={onStart}>
                    Begin Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </motion.div>
        </div>
    );
};

export default SplashScreen;
