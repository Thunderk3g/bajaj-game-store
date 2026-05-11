import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore, GAME_STATUS } from './store/useGameStore';
import WelcomeScreen from './components/WelcomeScreen';
import GamePage from './components/GamePage';
import GameOverScreen from './components/GameOverScreen';
import LeadCaptureScreen from './components/LeadCaptureScreen';
import CTAResultScreen from './components/CTAResultScreen';
import ThankYouScreen from './components/ThankYouScreen';

const App = () => {
  const { status, toast } = useGameStore();

  return (
    <div className="relative w-full h-screen-safe bg-[#0B1221] overflow-hidden">
      <AnimatePresence mode="wait">
        {status === GAME_STATUS.START && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <WelcomeScreen />
          </motion.div>
        )}

        {status === GAME_STATUS.PLAYING && (
          <motion.div
            key="gameplay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <GamePage />
          </motion.div>
        )}

        {status === GAME_STATUS.GAMEOVER && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <GameOverScreen />
          </motion.div>
        )}

        {status === GAME_STATUS.LEAD_CAPTURE && (
          <motion.div
            key="leadcapture"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="h-full"
          >
            <LeadCaptureScreen />
          </motion.div>
        )}

        {status === GAME_STATUS.CTA && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <CTAResultScreen />
          </motion.div>
        )}

        {status === GAME_STATUS.THANK_YOU && (
          <motion.div
            key="thankyou"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ThankYouScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-10 left-1/2 z-[100] px-6 py-3 rounded-full bg-white text-primary font-bold shadow-2xl border border-primary/20 pointer-events-none"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
