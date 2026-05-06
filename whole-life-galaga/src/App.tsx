import { useEffect, useState } from "react";
import { Screen, Lead, GameResult } from "./types";
import {
  SplashScreen,
  IntroScreen,
  InstructionsScreen,
  GameCanvas,
  EnterDetailsScreen,
  ScoringScreen,
  BookSlotScreen,
  ThankYouScreen,
  TcModal
} from "./components";

function App() {
  const [screen, setScreen] = useState<Screen>(Screen.Splash);
  const [result, setResult] = useState<GameResult>({
    score: 0,
    coveragePercent: 0,
    savingsBuilt: 0,
    enemiesDestroyed: 0,
    powerUpsCollected: 0,
    timeElapsed: 0
  });
  const [lead, setLead] = useState<Lead>({ name: "", phone: "" });
  const [showTcModal, setShowTcModal] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen(Screen.Intro), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const playAgain = () => {
    setResult({
      score: 0,
      coveragePercent: 0,
      savingsBuilt: 0,
      enemiesDestroyed: 0,
      powerUpsCollected: 0,
      timeElapsed: 0
    });
    setLead({ name: "", phone: "" });
    setScreen(Screen.Intro);
  };

  return (
    <main className="app-shell">
      <section className={`phone-frame screen-${screen}`}>
        {screen === Screen.Splash && <SplashScreen />}
        
        {screen === Screen.Intro && (
          <IntroScreen onPlay={() => setScreen(Screen.Instructions)} />
        )}

        {screen === Screen.Instructions && (
          <InstructionsScreen onStart={() => setScreen(Screen.Game)} />
        )}

        {screen === Screen.Game && (
          <GameCanvas
            onFinished={(r) => {
              setResult(r);
              setScreen(Screen.EnterDetails);
            }}
          />
        )}

        {screen === Screen.EnterDetails && (
          <EnterDetailsScreen
            lead={lead}
            setLead={setLead}
            onSubmit={() => setScreen(Screen.Scoring)}
            setShowTcModal={setShowTcModal}
          />
        )}

        {screen === Screen.Scoring && (
          <ScoringScreen
            lead={lead}
            result={result}
            onBookSlot={() => setScreen(Screen.BookSlot)}
            onPlayAgain={playAgain}
          />
        )}

        {screen === Screen.BookSlot && (
          <BookSlotScreen
            lead={lead}
            onComplete={() => setScreen(Screen.ThankYou)}
            setShowTcModal={setShowTcModal}
          />
        )}

        {screen === Screen.ThankYou && (
          <ThankYouScreen lead={lead} onPlayAgain={playAgain} />
        )}
      </section>

      {showTcModal && (
        <TcModal onClose={() => setShowTcModal(false)} />
      )}
    </main>
  );
}

export default App;