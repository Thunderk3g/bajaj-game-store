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
    <div className="w-full h-screen-safe bg-[#0B1221] overflow-hidden flex items-center justify-center">
      {/* Max-width constraint: on desktop shows as a centered mobile-format portrait game */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxWidth: '480px',
          overflow: 'hidden',
          background: '#0B1221',
        }}
      >
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

      {/* Toast Notifications — compact pill, above pedals, no HUD overlap */}
      <AnimatePresence>
        {status === GAME_STATUS.PLAYING && toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -16, x: '-50%' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed bottom-[185px] left-1/2 z-[200] pointer-events-none"
          >
            <div
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-base font-black whitespace-nowrap"
              style={{
                background: 'rgba(10, 18, 36, 0.92)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0, 242, 254, 0.35)',
                boxShadow: '0 0 18px rgba(0, 242, 254, 0.25), 0 6px 24px rgba(0,0,0,0.6)',
                letterSpacing: '0.04em'
              }}
            >
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
