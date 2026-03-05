import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const ShockOverlay = ({ isActive, onResolve }) => {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                >
                    {/* Background Overlay */}
                    <div className="absolute inset-0 bg-risk/40 backdrop-blur-md animate-pulse" />

                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative glass-panel border-risk/50 bg-bg/90 p-8 max-w-xs w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                    >
                        <div className="w-16 h-16 bg-risk/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-risk w-10 h-10" />
                        </div>

                        <h2 className="text-2xl font-heading font-bold mb-4 text-white">Market Shock!</h2>
                        <p className="text-sm text-white/70 mb-8 leading-relaxed">
                            Life just threw a curveball. Stay calm, reassess your priorities, and keep sorting. Clarity comes to those who persevere.
                        </p>

                        <Button
                            variant="danger"
                            fullWidth
                            onClick={onResolve}
                            className="shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        >
                            Resume Sorting
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShockOverlay;
