import { FormEvent, useEffect, useMemo, useState } from "react";
import heroArt from "./assets/shield-marble-hero.webp";
import { submitToLMS } from "./utils/api";
import { buildShareUrl } from "./utils/crypto";
import { shortenUrl } from "./utils/shortener";

type Screen = "splash" | "menu" | "instructions" | "game" | "lesson" | "lead" | "score";
type Cell = "invalid" | "empty" | "marble";
type IconName = "shield" | "marble" | "spark" | "target" | "clock" | "call" | "award";

type Lead = {
  name: string;
  phone: string;
};

type Result = {
  score: number;
  jumps: number;
  marblesLeft: number;
  protection: number;
  riskGap: number;
};

type Position = {
  row: number;
  col: number;
};

const GAME_SECONDS = 75;
const SIZE = 7;
const CENTER = 3;

function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [result, setResult] = useState<Result>({ score: 0, jumps: 0, marblesLeft: 32, protection: 0, riskGap: 0 });
  const [lead, setLead] = useState<Lead>({ name: "", phone: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen("menu"), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const retry = () => {
    setResult({ score: 0, jumps: 0, marblesLeft: 32, protection: 0, riskGap: 0 });
    setLead({ name: "", phone: "" });
    setScreen("instructions");
  };

  return (
    <main className="app-shell">
      <section className={`phone-frame screen-${screen}`}>
        {(screen === "splash" || screen === "menu") && <Hero isSplash={screen === "splash"} onPlay={() => setScreen("instructions")} />}
        {screen === "instructions" && <Instructions onNext={() => setScreen("game")} />}
        {screen === "game" && (
          <MarbleGame
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

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  switch (name) {
    case "shield":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 3 19 6v5c0 4.9-3.2 9.3-7 10-3.8-.7-7-5.1-7-10V6z" />
          <path d="m8.2 12.1 2.2 2.3 5.5-5.7" />
        </svg>
      );
    case "marble":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M7 10.5c2-2.9 6-4.3 10-3.5M6.8 14.6c2.8 1.7 6.9 2.1 10.4.8" />
        </svg>
      );
    case "spark":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m12 3 1.8 6.1L20 11l-6.2 1.9L12 19l-1.8-6.1L4 11l6.2-1.9z" />
        </svg>
      );
    case "target":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="7.8" />
          <circle cx="12" cy="12" r="3.3" />
          <path d="M12 2.8v3.2M21.2 12H18M12 18v3.2M6 12H2.8" />
        </svg>
      );
    case "clock":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.2v5l3.3 2" />
        </svg>
      );
    case "call":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7.3 4.8c.9-.9 2.2-.9 3 .1l1.4 1.7c.6.7.7 1.8.1 2.6l-1 1.4c.7 1.5 1.9 2.7 3.4 3.4l1.4-1c.8-.6 1.9-.5 2.6.1l1.7 1.4c1 .8 1 2.1.1 3l-1.5 1.5c-.8.8-2 1.1-3.1.7-5.8-2-10.4-6.6-12.4-12.4-.4-1.1-.1-2.3.7-3.1z" />
        </svg>
      );
    case "award":
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7 5.2h10v4.1c0 2.5-2.2 4.5-5 4.5s-5-2-5-4.5z" />
          <path d="M10.5 13.4 9.3 19l2.7-1.5 2.7 1.5-1.2-5.6" />
        </svg>
      );
  }
}

function MetricCard({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="metric-card">
      <span className="metric-icon">
        <Icon name={icon} />
      </span>
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
    </div>
  );
}

function SectionIcon({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div className="rule-card">
      <span className="rule-icon">
        <Icon name={icon} />
      </span>
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
    </div>
  );
}

function Hero({ isSplash, onPlay }: { isSplash: boolean; onPlay: () => void }) {
  return (
    <div className="hero-screen">
      <div className="hero-orb hero-orb-a" />
      <div className="hero-orb hero-orb-b" />
      <img className="hero-art" src={heroArt} alt="" />
      <div className="hero-vignette" />
      <div className="brand-pill">
        <Icon name="shield" />
        Bajaj Life campaign game
      </div>
      <div className="hero-copy">
        <p className="eyebrow">Brainvita marble puzzle</p>
        <h1>Shield Marble Vita</h1>
        <p className="subtitle">Jump marbles, remove financial worries, and discover the one risk strategy cannot remove alone.</p>
        <div className="hero-metrics">
          <MetricCard icon="marble" label="Board" value="7 x 7" />
          <MetricCard icon="spark" label="Style" value="Premium" />
          <MetricCard icon="target" label="Goal" value="High score" />
        </div>
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
      <div className="section-heading">
        <span className="section-emblem">
          <Icon name="spark" />
        </span>
        <div>
          <p className="eyebrow">How to play</p>
          <h2>Jump marbles to reduce worries.</h2>
        </div>
      </div>
      <div className="rule-stack">
        <SectionIcon icon="marble" title="Select a marble" text="Tap a marble that has another marble next to it and an empty hole beyond." />
        <SectionIcon icon="target" title="Jump into empty holes" text="The jumped marble disappears, like clearing one responsibility from the board." />
        <SectionIcon icon="shield" title="Keep your shield strong" text="Even a smart board can end with one major life risk unless term cover is in place." />
      </div>
      <div className="instruction-callout">
        <Icon name="spark" />
        <span>Goal: make as many valid jumps as possible before the final hidden risk appears.</span>
      </div>
      <button className="primary-button" onClick={onNext}>Next</button>
    </div>
  );
}

function MarbleGame({ onFinished }: { onFinished: (result: Result) => void }) {
  const [board, setBoard] = useState<Cell[][]>(() => createBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(GAME_SECONDS);
  const [jumps, setJumps] = useState(0);
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState("Select a marble");
  const marblesLeft = countMarbles(board);
  const protection = Math.min(88, jumps * 7 + Math.max(0, 32 - marblesLeft) * 2);
  const validMoves = getValidMoves(board);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            onFinished(makeResult(score, jumps, countMarbles(board), protection));
          }, 550);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [board, jumps, onFinished, protection, score]);

  useEffect(() => {
    if (validMoves.length > 0) return;
    const timer = window.setTimeout(() => {
      onFinished(makeResult(score, jumps, marblesLeft, protection));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [jumps, marblesLeft, onFinished, protection, score, validMoves.length]);

  const tapCell = (row: number, col: number) => {
    const cell = board[row][col];
    if (cell === "invalid") return;

    if (selected) {
      const move = getMove(board, selected, { row, col });
      if (move) {
        const next = board.map((line) => [...line]);
        next[selected.row][selected.col] = "empty";
        next[move.middle.row][move.middle.col] = "empty";
        next[row][col] = "marble";
        setBoard(next);
        setSelected(null);
        setJumps((value) => value + 1);
        setScore((value) => value + 45 + Math.max(0, secondsLeft));
        setToast("Responsibility cleared");
        return;
      }
    }

    if (cell === "marble") {
      setSelected({ row, col });
      setToast("Choose an empty landing hole");
      return;
    }

    setSelected(null);
    setToast("That move needs a marble jump");
  };

  return (
    <div className="game-screen">
      <div className="game-topline">
        <div>
          <p className="eyebrow">Campaign challenge</p>
          <h2>Lock in your best board.</h2>
        </div>
        <span className="game-chip">
          <Icon name="shield" />
          Live play
        </span>
      </div>
      <div className="hud">
        <div><span><Icon name="award" /> Score</span><b>{score}</b></div>
        <div><span><Icon name="marble" /> Jumps</span><b>{jumps}</b></div>
        <div><span><Icon name="clock" /> Time</span><b>{secondsLeft}s</b></div>
      </div>
      <div className="board-wrap">
        <div className="board-sheen" />
        <div className="marble-board" aria-label="Shield marble vita board">
          {board.flatMap((line, row) =>
            line.map((cell, col) => {
              const isSelected = selected?.row === row && selected.col === col;
              const isTarget = selected ? Boolean(getMove(board, selected, { row, col })) : false;
              return (
                <button
                  key={`${row}-${col}`}
                  className={`hole hole-${cell} ${isSelected ? "selected" : ""} ${isTarget ? "target" : ""}`}
                  disabled={cell === "invalid"}
                  onClick={() => tapCell(row, col)}
                  aria-label={`Row ${row + 1} column ${col + 1}`}
                >
                  {cell === "marble" && <span className="marble" />}
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="status-panel">
        <div>
          <span><Icon name="shield" /> Protection built</span>
          <b>{protection}%</b>
        </div>
        <div>
          <span><Icon name="marble" /> Marbles left</span>
          <b>{marblesLeft}</b>
        </div>
      </div>
      <div className="toast">
        <Icon name="spark" />
        <span>{toast}</span>
      </div>
    </div>
  );
}

function Lesson({ result, onRetry, onReveal }: { result: Result; onRetry: () => void; onReveal: () => void }) {
  return (
    <div className="panel-screen lesson-screen">
      <div className="section-heading">
        <span className="section-emblem">
          <Icon name="shield" />
        </span>
        <div>
          <p className="eyebrow">Board locked</p>
          <h2>Strategy cleared many worries, but not the biggest risk.</h2>
        </div>
      </div>
      <p>
        You removed responsibilities one jump at a time, but one sudden life event can still leave the family exposed.
        Term life insurance is built for that gap: low premium, high coverage, pure protection.
      </p>
      <div className="teaser-grid">
        <div><span>Jumps made</span><b>{result.jumps}</b></div>
        <div><span>Risk gap</span><b>{result.riskGap}</b></div>
      </div>
      <p className="score-tease">Reveal your final marble shield score and why term cover changes the ending.</p>
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

  const submit = async (event: FormEvent) => {
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
      game: "Shield Marble Vita",
      createdAt: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem("shieldMarbleVitaLeads") || "[]");
    localStorage.setItem("shieldMarbleVitaLeads", JSON.stringify([...existing, savedLead]));
    try {
      await submitToLMS({
        name: lead.name.trim(),
        mobile_no: phoneClean,
        score: result.score,
        summary_dtls: "Shield Marble Vita - Post Game Lead"
      });
    } catch (err) {
      console.error("API submission failed", err);
    } finally {
      onDone();
    }
  };

  return (
    <form className="panel-screen lead-screen" onSubmit={submit}>
      <div className="section-heading">
        <span className="section-emblem">
          <Icon name="call" />
        </span>
        <div>
          <p className="eyebrow">Unlock score</p>
          <h2>Get your marble result</h2>
        </div>
      </div>
      <p>A Bajaj Life insurance marketing representative can call you with term cover details.</p>
      <label>
        Name
        <input value={lead.name} autoComplete="name" placeholder="Your name" onChange={(event) => setLead({ ...lead, name: event.target.value })} />
      </label>
      <label>
        Indian mobile number
        <input
          value={lead.phone}
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="10 digit number"
          onChange={(event) => setLead({ ...lead, phone: event.target.value.replace(/\D/g, "") })}
        />
      </label>
      {error && <div className="form-error">{error}</div>}
      <button className="primary-button" type="submit">Submit and view score</button>
    </form>
  );
}

function Score({ lead, result, onRetry }: { lead: Lead; result: Result; onRetry: () => void }) {
  const handleShare = async () => {
    const rawUrl = buildShareUrl() || window.location.href;
    const shareUrl = await shortenUrl(rawUrl);
    const shareData = {
      title: "Shield Marble Vita",
      text: `Hi, I scored ${result.score} on this game. Try it: ${shareUrl}`,
      url: shareUrl
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* share cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="panel-screen score-screen">
      <div className="section-heading score-heading">
        <span className="section-emblem">
          <Icon name="award" />
        </span>
        <div>
          <p className="eyebrow">Thank you, {lead.name.trim()}</p>
          <h2>Your Marble Shield Score</h2>
        </div>
      </div>
      <div className="score-ring">
        <Icon name="shield" className="score-ring-icon" />
        <span>{result.score}</span>
        <small>/ 1000</small>
      </div>
      <div className="score-list">
        <div><b>{result.jumps}</b><span>responsibilities cleared</span></div>
        <div><b>{result.marblesLeft}</b><span>worries left</span></div>
        <div><b>{result.protection}%</b><span>protection built</span></div>
      </div>
      <p>
        You lost because the final risk cannot be solved by clever moves alone. Term insurance helps protect the family before the board changes.
      </p>
      <div className="thanks-note">Thanks for subscribing to a Bajaj Life insurance marketing call.</div>
      <button className="ghost-button" onClick={handleShare}>Share</button>
      <button className="ghost-button" onClick={onRetry}>Play again</button>
    </div>
  );
}

function createBoard(): Cell[][] {
  return Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => {
      const invalid = (row < 2 || row > 4) && (col < 2 || col > 4);
      if (invalid) return "invalid";
      return row === CENTER && col === CENTER ? "empty" : "marble";
    })
  );
}

function countMarbles(board: Cell[][]) {
  return board.flat().filter((cell) => cell === "marble").length;
}

function getMove(board: Cell[][], from: Position, to: Position) {
  if (board[to.row]?.[to.col] !== "empty") return null;
  const rowDelta = to.row - from.row;
  const colDelta = to.col - from.col;
  const validDistance = (Math.abs(rowDelta) === 2 && colDelta === 0) || (Math.abs(colDelta) === 2 && rowDelta === 0);
  if (!validDistance) return null;
  const middle = { row: from.row + rowDelta / 2, col: from.col + colDelta / 2 };
  if (board[from.row][from.col] !== "marble" || board[middle.row][middle.col] !== "marble") return null;
  return { middle };
}

function getValidMoves(board: Cell[][]) {
  const moves: Array<{ from: Position; to: Position }> = [];
  const dirs = [
    { row: 2, col: 0 },
    { row: -2, col: 0 },
    { row: 0, col: 2 },
    { row: 0, col: -2 }
  ];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== "marble") continue;
      for (const dir of dirs) {
        const to = { row: row + dir.row, col: col + dir.col };
        if (to.row < 0 || to.row >= SIZE || to.col < 0 || to.col >= SIZE) continue;
        if (getMove(board, { row, col }, to)) moves.push({ from: { row, col }, to });
      }
    }
  }
  return moves;
}

function makeResult(score: number, jumps: number, marblesLeft: number, protection: number): Result {
  const riskGap = Math.max(120, 260 - protection * 2 + marblesLeft * 3);
  return {
    score: Math.max(0, Math.min(1000, score + jumps * 28 - riskGap)),
    jumps,
    marblesLeft,
    protection,
    riskGap
  };
}

export default App;
