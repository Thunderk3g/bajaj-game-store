import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import LeadCaptureScreen from './components/LeadCaptureScreen';
import ResultScreen from './components/ResultScreen';
import ThankYou from './components/ThankYou';

import { useGameState } from './hooks/useGameState';

function App() {
  const [screen, setScreen] = useState('start'); // 'start', 'game', 'lead', 'result', 'thankyou'
  const [score, setScore] = useState(0);
  const [userName, setUserName] = useState('');

  const startGame = (name) => {
    setUserName(name);
    setScreen('game');
  };

  const endGame = (finalScore) => {
    setScore(finalScore);
    setScreen('lead');
  };

  const restartGame = () => {
    setScore(0);
    setUserName('');
    setScreen('start');
  };

  const replayGame = () => {
    setScore(0);
    setScreen('game');
  };

  const showThankYou = () => {
    setScreen('thankyou');
  };

  const { toast } = useGameState();

  return (
    <div className="w-full h-full min-h-screen overflow-hidden font-sans text-white relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-0 left-1/2 z-[200] px-8 py-4 rounded-xl shadow-2xl font-black text-sm sm:text-base tracking-widest uppercase border-2 backdrop-blur-md ${toast.type === 'error' ? 'bg-red-600/90 border-red-400 text-white' : 'bg-[#0066B2]/90 border-blue-400 text-white'
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <motion.div
            key="start"
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
            <StartScreen onStart={startGame} />
          </motion.div>
        )}

        {screen === 'game' && (
          <motion.div
            key="game"
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            <GameScreen onEnd={endGame} />
          </motion.div>
        )}

        {screen === 'lead' && (
          <motion.div
            key="lead"
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LeadCaptureScreen
              onSuccess={(name) => {
                setUserName(name);
                setScreen('result');
              }}
            />
          </motion.div>
        )}

        {screen === 'result' && (
          <motion.div
            key="result"
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <ResultScreen
              score={score}
              firstName={userName}
              onRestart={replayGame}
              onThankYou={showThankYou}
            />
          </motion.div>
        )}

        {screen === 'thankyou' && (
          <motion.div
            key="thankyou"
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ThankYou onHome={restartGame} onReplay={replayGame} firstName={userName} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
