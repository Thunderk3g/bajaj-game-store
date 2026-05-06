import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import heroArt from "./assets/cover-word-hero.webp";

type Screen = "splash" | "menu" | "instructions" | "game" | "lesson" | "lead" | "score";

type Lead = {
  name: string;
  phone: string;
};

type Result = {
  score: number;
  solvedWords: number;
  wrongGuesses: number;
  shield: number;
  missedWord: string;
};

const GAME_SECONDS = 90;
const MAX_WRONG = 7;
const WORDS = [
  { word: "TERM", clue: "Fixed years of protection" },
  { word: "PREMIUM", clue: "Small amount paid regularly" },
  { word: "COVER", clue: "Financial shield amount" },
  { word: "FAMILY", clue: "Who the plan protects" },
  { word: "LOAN", clue: "A responsibility term cover can protect" },
  { word: "PROTECTION", clue: "The main purpose of term insurance" }
];
const PLAYABLE_WORDS = WORDS.slice(0, -1);
const FINAL_WORD = WORDS[WORDS.length - 1].word;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [result, setResult] = useState<Result>({ score: 0, solvedWords: 0, wrongGuesses: 0, shield: 100, missedWord: FINAL_WORD });
  const [lead, setLead] = useState<Lead>({ name: "", phone: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen("menu"), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const retry = () => {
    setResult({ score: 0, solvedWords: 0, wrongGuesses: 0, shield: 100, missedWord: FINAL_WORD });
    setLead({ name: "", phone: "" });
    setScreen("instructions");
  };

  return (
    <main className="app-shell">
      <section className={`phone-frame screen-${screen}`}>
        {(screen === "splash" || screen === "menu") && <Hero isSplash={screen === "splash"} onPlay={() => setScreen("instructions")} />}
        {screen === "instructions" && <Instructions onNext={() => setScreen("game")} />}
        {screen === "game" && (
          <WordGame
            onFinished={(nextResult) => {
              setResult(nextResult);
              setScreen("lesson");
            }}
          />
        )}
        {screen === "lesson" && <Lesson result={result} onRetry={retry} onReveal={() => setScreen("lead")} />}
        {screen === "lead" && <LeadCapture lead={lead} setLead={setLead} result={result} onDone={() => setScreen("score")} />}
        {screen === "score" && <Score lead={lead} result={result} onRetry={retry} />}
      </section>
    </main>
  );
}

function Hero({ isSplash, onPlay }: { isSplash: boolean; onPlay: () => void }) {
  return (
    <div className="hero-screen">
      <img className="hero-art" src={heroArt} alt="" />
      <div className="hero-vignette" />
      <div className="brand-pill">Bajaj Life campaign game</div>
      <div className="hero-copy">
        <p className="eyebrow">Hangman word challenge</p>
        <h1>Cover Word Rescue</h1>
        <p className="subtitle">Guess the protection words before wrong letters crack the family shield.</p>
      </div>
      {isSplash ? (
        <div className="loading-mark">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <button className="primary-button" onClick={onPlay}>Play game</button>
      )}
    </div>
  );
}

function Instructions({ onNext }: { onNext: () => void }) {
  return (
    <div className="panel-screen instruction-screen">
      <div>
        <p className="eyebrow">How to play</p>
        <h2>Guess words. Protect the shield.</h2>
      </div>
      <div className="rule-stack">
        <div className="rule-card">
          <b>Read the clue</b>
          <span>Every word teaches a term life insurance idea.</span>
        </div>
        <div className="rule-card">
          <b>Tap letters</b>
          <span>Correct letters build score. Wrong letters crack the shield.</span>
        </div>
        <div className="rule-card">
          <b>Beat 90 seconds</b>
          <span>The final word cannot be completed without protection.</span>
        </div>
      </div>
      <div className="instruction-callout">There is no hanging figure here. The family shield takes damage because the message is about protection, not fear.</div>
      <button className="primary-button" onClick={onNext}>Next</button>
    </div>
  );
}

function WordGame({ onFinished }: { onFinished: (result: Result) => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);
  const [wrong, setWrong] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [toast, setToast] = useState("Pick a letter");
  const finishedRef = useRef(false);
  const stateRef = useRef({ score: 0, solved: 0, wrong: 0, shield: 100, wordIndex: 0 });

  const current = PLAYABLE_WORDS[wordIndex];
  const visibleWord = current.word.split("").map((letter) => (guessed.includes(letter) ? letter : ""));
  const isSolved = current.word.split("").every((letter) => guessed.includes(letter));
  const shield = Math.max(0, 100 - wrong * 13);
  const keyboardLocked = isSolved || finishedRef.current || secondsLeft <= 0;

  useEffect(() => {
    stateRef.current = { score, solved, wrong, shield, wordIndex };
  }, [score, solved, wrong, shield, wordIndex]);

  const finishGame = useCallback(
    (reason: "time" | "shield" | "completed") => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const snapshot = stateRef.current;
      const penalty = reason === "shield" ? 80 : 0;
      const shieldLeft = reason === "time" ? Math.max(0, snapshot.shield - 32) : 0;

      window.setTimeout(() => {
        onFinished({
          score: Math.max(0, snapshot.score - penalty),
          solvedWords: snapshot.solved,
          wrongGuesses: snapshot.wrong,
          shield: shieldLeft,
          missedWord: reason === "completed" ? FINAL_WORD : PLAYABLE_WORDS[snapshot.wordIndex].word
        });
      }, 450);
    },
    [onFinished]
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          finishGame("time");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finishGame]);

  useEffect(() => {
    if (!isSolved || finishedRef.current) return;
    const timer = window.setTimeout(() => {
      const nextSolved = solved + 1;
      const nextScore = score + 120 + Math.max(0, secondsLeft);
      setSolved(nextSolved);
      setScore(nextScore);
      stateRef.current = { score: nextScore, solved: nextSolved, wrong, shield, wordIndex };
      setToast("Word rescued");
      if (wordIndex >= PLAYABLE_WORDS.length - 1) {
        finishGame("completed");
        return;
      }
      setWordIndex((value) => value + 1);
      setGuessed([]);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [finishGame, isSolved, score, secondsLeft, shield, solved, wordIndex, wrong]);

  const guess = (letter: string) => {
    if (guessed.includes(letter) || keyboardLocked) return;
    setGuessed((value) => [...value, letter]);
    if (current.word.includes(letter)) {
      setToast("Correct letter");
      setScore((value) => value + 18);
    } else {
      setToast("Wrong letter. Shield cracked.");
      const nextWrong = wrong + 1;
      setWrong(nextWrong);
      stateRef.current = { score, solved, wrong: nextWrong, shield: Math.max(0, 100 - nextWrong * 13), wordIndex };
      if (nextWrong >= MAX_WRONG) finishGame("shield");
    }
  };

  return (
    <div className="game-screen">
      <div className="hud">
        <div><span>Score</span><b>{score}</b></div>
        <div><span>Shield</span><b>{shield}%</b></div>
        <div><span>Time</span><b>{secondsLeft}s</b></div>
      </div>
      <div className="progress-note">Word {wordIndex + 1} of {PLAYABLE_WORDS.length}</div>
      <div className="shield-stage">
        <div className="shield-orb" style={{ "--shield": `${shield}%` } as CSSProperties}>
          <span>{MAX_WRONG - wrong}</span>
          <small>lives</small>
        </div>
        <div className="crack-meter">
          {Array.from({ length: MAX_WRONG }, (_, index) => <span key={index} className={index < wrong ? "used" : ""} />)}
        </div>
      </div>
      <div className="word-panel">
        <p className="clue">{current.clue}</p>
        <div className="word-slots">
          {visibleWord.map((letter, index) => (
            <span key={`${current.word}-${index}`} className={letter ? "filled" : ""}>{letter}</span>
          ))}
        </div>
        <div className="toast">{toast}</div>
      </div>
      <div className="keyboard">
        {LETTERS.map((letter) => (
          <button key={letter} disabled={guessed.includes(letter) || keyboardLocked} onClick={() => guess(letter)}>
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

function Lesson({ result, onRetry, onReveal }: { result: Result; onRetry: () => void; onReveal: () => void }) {
  return (
    <div className="panel-screen lesson-screen">
      <p className="eyebrow">Shield broken</p>
      <h2>The missing word was {result.missedWord}.</h2>
      <p>
        You solved useful clues, but the shield still failed when the final risk arrived. Term life insurance is simple protection:
        low premium, high coverage, and a financial safety net for the family.
      </p>
      <div className="teaser-grid">
        <div><span>Words rescued</span><b>{result.solvedWords}</b></div>
        <div><span>Shield left</span><b>{result.shield}%</b></div>
      </div>
      <p className="score-tease">Reveal your word rescue score and see why protection matters.</p>
      <div className="button-row">
        <button className="ghost-button" onClick={onRetry}>Retry</button>
        <button className="primary-button" onClick={onReveal}>Reveal score</button>
      </div>
    </div>
  );
}

function LeadCapture({
  lead,
  setLead,
  result,
  onDone
}: {
  lead: Lead;
  setLead: (lead: Lead) => void;
  result: Result;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const phoneClean = useMemo(() => lead.phone.replace(/\D/g, ""), [lead.phone]);
  const validPhone = /^[6-9]\d{9}$/.test(phoneClean);
  const validName = lead.name.trim().length >= 2;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validName) {
      setError("Please enter your name.");
      return;
    }
    if (!validPhone) {
      setError("Enter a valid 10 digit Indian mobile number.");
      return;
    }
    const savedLead = {
      ...lead,
      phone: phoneClean,
      score: result.score,
      game: "Cover Word Rescue",
      createdAt: new Date().toISOString()
    };
    const existingRaw = localStorage.getItem("coverWordRescueLeads");
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem("coverWordRescueLeads", JSON.stringify([...existing, savedLead]));
    onDone();
  };

  return (
    <form className="panel-screen lead-screen" onSubmit={submit}>
      <p className="eyebrow">Unlock score</p>
      <h2>Get your word score</h2>
      <p>A Bajaj Life insurance marketing representative can call you with term cover details.</p>
      <label>
        Name
        <input
          value={lead.name}
          autoComplete="name"
          placeholder="Your name"
          onChange={(event) => {
            setError("");
            setLead({ ...lead, name: event.target.value });
          }}
        />
      </label>
      <label>
        Indian mobile number
        <input
          value={lead.phone}
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10 digit number"
          onChange={(event) => {
            setError("");
            setLead({ ...lead, phone: event.target.value.replace(/\D/g, "") });
          }}
        />
      </label>
      {error && <div className="form-error">{error}</div>}
      <button className="primary-button" type="submit">Submit and view score</button>
    </form>
  );
}

function Score({ lead, result, onRetry }: { lead: Lead; result: Result; onRetry: () => void }) {
  return (
    <div className="panel-screen score-screen">
      <p className="eyebrow">Thank you, {lead.name.trim()}</p>
      <h2>Your Word Rescue Score</h2>
      <div className="score-ring">
        <span>{result.score}</span>
        <small>/ 1000</small>
      </div>
      <div className="score-list">
        <div><b>{result.solvedWords}</b><span>words rescued</span></div>
        <div><b>{result.wrongGuesses}</b><span>wrong guesses</span></div>
        <div><b>{result.shield}%</b><span>shield left</span></div>
      </div>
      <p>
        You lost because the final protection word arrived too late. Term insurance helps families prepare before uncertainty reveals itself.
      </p>
      <div className="thanks-note">Thanks for subscribing to a Bajaj Life insurance marketing call.</div>
      <button className="ghost-button" onClick={onRetry}>Play again</button>
    </div>
  );
}

export default App;
