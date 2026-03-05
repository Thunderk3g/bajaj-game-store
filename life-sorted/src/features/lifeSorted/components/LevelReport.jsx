import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const LevelReport = ({ level, moves, mistakes, sorted, onNext }) => {
    return (
        <div className="flex flex-col items-center text-center max-w-sm mx-auto px-6">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-growth/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            >
                <CheckCircle2 className="text-growth w-12 h-12" />
            </motion.div>

            <h2 className="text-3xl font-heading font-bold mb-2">Clarity Restored!</h2>
            <p className="text-white/50 text-sm mb-8">Level {level} completed. You're bringing balance to life.</p>

            <Card className="w-full mb-10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-white/70">
                        <TrendingUp size={16} />
                        <span className="text-sm">Moves Made</span>
                    </div>
                    <span className="font-bold text-white">{moves}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-white/70">
                        <AlertCircle size={16} className="text-risk" />
                        <span className="text-sm">Mis-sorts</span>
                    </div>
                    <span className="font-bold text-white">{mistakes}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                        <span className="text-sm">Sorted Elements</span>
                    </div>
                    <span className="font-bold text-teal">{sorted}</span>
                </div>
            </Card>

            <Button fullWidth onClick={onNext} size="lg">
                Proceed to Level {level + 1}
            </Button>
        </div>
    );
};

export default LevelReport;
