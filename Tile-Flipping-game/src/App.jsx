import { GameProvider, useGame } from './context/GameContext';
import { useToast } from './hooks/useToast';
import { SCREENS } from './constants/game';
import IntroScreen from './components/screens/IntroScreen';
import GameScreen from './components/screens/GameScreen';
import ScoreScreen from './components/screens/ScoreScreen';
import ThankYouScreen from './components/screens/ThankYouScreen';
import ToastContainer from './components/ui/ToastContainer';

/** Inner shell reads from context — must be inside GameProvider */
function AppShell() {
  const { state } = useGame();
  const { toasts, showToast } = useToast();
  const { screen } = state;

  function renderScreen() {
    switch (screen) {
      case SCREENS.INTRO: return <IntroScreen />;
      case SCREENS.GAME: return <GameScreen showToast={showToast} />;
      case SCREENS.SCORE: return <ScoreScreen showToast={showToast} />;
      case SCREENS.THANK_YOU: return <ThankYouScreen />;
      default: return <IntroScreen />;
    }
  }

  return (
    <div className="app-shell">
      {renderScreen()}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
