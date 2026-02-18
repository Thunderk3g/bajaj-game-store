import React from 'react';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

const Intro = ({ onStart }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-[12rem] h-[12rem] bg-primary-50 rounded-full flex items-center justify-center p-8"
            >
                <div className="w-full h-full bg-primary-500 rounded-full flex items-center justify-center text-[4rem] shadow-xl shadow-primary-500/30">
                    🎯
                </div>
            </motion.div>

            <div className="space-y-4 max-w-[32rem]">
                <h1 className="text-[2.5rem] font-extrabold text-slate-900 leading-tight">
                    Discover Your <br />
                    <span className="text-primary-500 underline decoration-accent-orange decoration-4 underline-offset-8">
                        Retirement Readiness
                    </span>
                </h1>
                <p className="text-[1.125rem] text-slate-500">
                    Embark on a fun, interactive journey to see how prepared you are for your future self. It only takes 2 minutes!
                </p>
            </div>

            <div className="w-full max-w-[20rem] pt-8">
                <Button
                    onClick={onStart}
                    className="w-full h-[4rem] text-[1.125rem] bg-primary-500 hover:bg-primary-600 shadow-xl shadow-primary-500/40"
                >
                    BEGIN ASSESSMENT
                </Button>
                <p className="mt-4 text-[0.875rem] text-slate-400">
                    No credit card required • Instant results
                </p>
            </div>
        </div>
    );
};

export default Intro;
