import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { AlertCircle } from 'lucide-react';

const GameOverScreen = ({ onNext }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-[#0a0a25]/60 backdrop-blur-sm z-[60] p-6 text-center"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <Card className="w-full shadow-2xl border-tetris-red/30">
                    <div className="flex justify-center mb-6">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <AlertCircle className="w-16 h-16 text-tetris-red" />
                        </motion.div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tighter">Game Over</h2>

                    <div className="space-y-4 mb-8">
                        <p className="text-lg text-slate-700 font-bold opacity-90 leading-tight">
                            "No worries. You did well — this is just a game."
                        </p>
                        <p className="text-base text-blue-600 font-black uppercase tracking-widest leading-tight">
                            "Real life doesn’t give many chances. Planning ahead matters."
                        </p>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default GameOverScreen;
