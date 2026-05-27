const fs = require("fs-extra");
const path = require("path");

console.log("📦 Copying game builds to Angular Shell assets...\n");

const ROOT_DIR = path.resolve(__dirname, "..");
const SHELL_GAMES_DIR = path.join(
  ROOT_DIR,
  "angular-shell",
  "src",
  "assets",
  "games",
);

// Ensure games directory exists
fs.ensureDirSync(SHELL_GAMES_DIR);

const games = [
  {
    name: "scramble-words",
    source: path.join(ROOT_DIR, "Scramble-Words", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "scramble-words"),
  },
  {
    name: "life-goals",
    source: path.join(ROOT_DIR, "life-goals", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-goals"),
  },
  {
    name: "quiz-game",
    source: path.join(ROOT_DIR, "quiz-game", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "quiz-game"),
  },
  {
    name: "life-milestone-race",
    source: path.join(ROOT_DIR, "life-milestone-race", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-milestone-race"),
  },
  {
    name: "retirement-readiness-journey",
    source: path.join(ROOT_DIR, "retirement-readiness-journey", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "retirement-readiness-journey"),
  },
  {
    name: "secure-saga",
    source: path.join(ROOT_DIR, "secure-saga", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "secure-saga"),
  },
  {
    name: "retirement-sudoku",
    source: path.join(ROOT_DIR, "retirement-sudoku", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "retirement-sudoku"),
  },
  {
    name: "financial-tetris",
    source: path.join(ROOT_DIR, "financial-tetris", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "financial-tetris"),
  },
  {
    name: "life-shield-bomber",
    source: path.join(ROOT_DIR, "life-shield-bomber", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-shield-bomber"),
  },
  {
    name: "tile-flipping-game",
    source: path.join(ROOT_DIR, "Tile-Flipping-game", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "tile-flipping-game"),
  },
  {
    name: "Snake-Life",
    source: path.join(ROOT_DIR, "Snake-Life", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "Snake-Life"),
  },
  {
    name: "life-snakes-ladders",
    source: path.join(ROOT_DIR, "life-snakes-ladders", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-snakes-ladders"),

  },
  {
    name: "life-flight",
    source: path.join(ROOT_DIR, "life-flight", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-flight"),
  },
  {
    name: "one-life",
    source: path.join(ROOT_DIR, "one-life", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "one-life"),
  },
  {
    name: "life-sorted",
    source: path.join(ROOT_DIR, "life-sorted", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-sorted"),
  },
  {
    name: "tower-defense",
    source: path.join(ROOT_DIR, "tower-defense", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "tower-defense"),
  },
  {
    name: "stackibility-stack",
    source: path.join(ROOT_DIR, "stackibility-stack", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "stackibility-stack"),
  },
  {
    name: "health-shield",
    source: path.join(ROOT_DIR, "health-shield", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "health-shield"),
  },
  {
    name: "life-goals-bubble-shooter",
    source: path.join(ROOT_DIR, "life-goals-bubble-shooter", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "life-goals-bubble-shooter"),
  },
  {
    name: "cover-word-rescue",
    source: path.join(ROOT_DIR, "cover-word-rescue", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "cover-word-rescue"),
  },
  {
    name: "debt-defender",
    source: path.join(ROOT_DIR, "debt-defender", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "debt-defender"),
  },
  {
    name: "shield-marble-vita",
    source: path.join(ROOT_DIR, "shield-marble-vita", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "shield-marble-vita"),
  },
  {
    name: "jumbled-quest",
    source: path.join(ROOT_DIR, "jumbled-quest", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "jumbled-quest"),
  },
  {
    name: "ulip-wealth-whacker",
    source: path.join(ROOT_DIR, "ulip-wealth-whacker", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "ulip-wealth-whacker"),
  },
  {
    name: "guardian-strike",
    source: path.join(ROOT_DIR, "guardian-strike", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "guardian-strike"),
  },
  {
    name: "future-climb",
    source: path.join(ROOT_DIR, "future-climb", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "future-climb"),
  },
  {
    name: "fortune-slice",
    source: path.join(ROOT_DIR, "fortune-slice", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "fortune-slice"),
  },
  {
    name: "legacy-sweep",
    source: path.join(ROOT_DIR, "legacy-sweep", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "legacy-sweep"),
  },
  {
    name: "future-sprint",
    source: path.join(ROOT_DIR, "future-sprint", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "future-sprint"),
  },
  {
    name: "guardian-grid",
    source: path.join(ROOT_DIR, "guardian-grid", "dist"),
    destination: path.join(SHELL_GAMES_DIR, "guardian-grid"),
  },
];

// Helper to robustly delete directories (fixes Windows ENOTEMPTY/EPERM issues)
const robustRemove = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;

  // Strategy 1: Simple Retry
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.removeSync(dirPath);
      return; // Success
    } catch (err) {
      if (i === maxRetries - 1) break;

      console.warn(
        `    ⚠️ Locking issue with ${path.basename(dirPath)}. Retrying (${i + 1}/${maxRetries})...`,
      );
      const start = Date.now();
      while (Date.now() - start < 500) { } // Wait 500ms
    }
  }

  // Strategy 2: Rename and Abandon
  try {
    const trashPath = `${dirPath}_trash_${Date.now()}`;
    fs.renameSync(dirPath, trashPath);
    console.log(
      `    ⚠️ Moved locked folder to ${path.basename(trashPath)} to proceed.`,
    );
    fs.remove(trashPath).catch(() => { });
    return;
  } catch (renameErr) {
    console.error(
      `    ❌ Could not remove or move ${dirPath}. Please close any apps using it.`,
    );
    throw renameErr;
  }
};

games.forEach((game) => {
  console.log(`  ✓ Copying ${game.name}...`);
  robustRemove(game.destination);

  if (fs.existsSync(game.source)) {
    try {
      fs.copySync(game.source, game.destination);
      console.log(`    → ${game.destination}`);
    } catch (err) {
      console.error(`    ❌ Failed to copy ${game.name}:`, err.message);
    }
  } else {
    console.warn(`    ⚠ Warning: ${game.source} not found, skipping...`);
  }
});

console.log("\n✅ All games copied to Shell assets!\n");

const manifest = {
  "scramble-words": {
    remoteEntry: "assets/games/scramble-words/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Scramble Words",
    popular: false,
    gameId: "GAME_001",
    assets: [],
  },
  "life-goals": {
    remoteEntry: "assets/games/life-goals/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Life Goals Preparedness",
    popular: true,
    gameId: "GAME_002",
    assets: [
      "assets/games/life-goals/assets/videos/business.mp4",
      "assets/games/life-goals/assets/videos/child_edu.mp4",
      "assets/games/life-goals/assets/videos/child_marriage.mp4",
      "assets/games/life-goals/assets/videos/dream_car.mp4",
      "assets/games/life-goals/assets/videos/financial_security.mp4",
      "assets/games/life-goals/assets/videos/health.mp4",
      "assets/games/life-goals/assets/videos/house.mp4",
      "assets/games/life-goals/assets/videos/retirement.mp4",
      "assets/games/life-goals/assets/videos/travel.mp4",
    ],
  },
  "quiz-game": {
    remoteEntry: "assets/games/quiz-game/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Quiz Challenge",
    popular: true,
    gameId: "GAME_003",
    assets: [
      "assets/games/quiz-game/assets/bajaj.png",
    ],
  },
  "life-milestone-race": {
    remoteEntry: "assets/games/life-milestone-race/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Life Milestone Race",
    popular: true,
    gameId: "GAME_004",
    assets: [],
  },
  "retirement-readiness-journey": {
    remoteEntry: "assets/games/retirement-readiness-journey/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Retirement Readiness Journey",
    popular: true,
    gameId: "GAME_005",
    assets: [],
  },
  "secure-saga": {
    remoteEntry: "assets/games/secure-saga/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Secure Saga",
    popular: true,
    gameId: "GAME_006",
    assets: [],
  },
  "retirement-sudoku": {
    remoteEntry: "assets/games/retirement-sudoku/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Retirement Sudoku",
    popular: true,
    gameId: "GAME_007",
    assets: [],
  },
  "financial-tetris": {
    remoteEntry: "assets/games/financial-tetris/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Financial Tetris",
    popular: true,
    gameId: "GAME_008",
    assets: [],
  },
  "life-shield-bomber": {
    remoteEntry: "assets/games/life-shield-bomber/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Life Shield Bomber",
    popular: true,
    gameId: "GAME_009",
    assets: [],
  },
  "tile-flipping-game": {
    remoteEntry: "assets/games/tile-flipping-game/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Tile Flipping Game",
    popular: true,
    gameId: "GAME_010",
    assets: [],
  },
  "Snake-Life": {
    remoteEntry: "assets/games/Snake-Life/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Snake Life Game",
    gameId: "GAME_011"
  },
  "life-flight": {
    remoteEntry: "assets/games/life-flight/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Life Flight",
    popular: true,
    gameId: "GAME_013",
    assets: [],
  },
  "life-snakes-ladders": {
    remoteEntry: "assets/games/life-snakes-ladders/index.js",
    exposedModule: "./LifeSnakesLaddersModule",
    type: "react",
    displayName: "Life Snakes & Ladders",
    popular: true,
    gameId: "GAME_012",
    assets: [],
  },
  "one-life": {
    remoteEntry: "assets/games/one-life/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "One Life",
    popular: true,
    gameId: "GAME_014",
    assets: [],
  },
  "life-sorted": {
    remoteEntry: "assets/games/life-sorted/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Life Sorted",
    popular: true,
    gameId: "GAME_015",
    assets: [],
  },
  "tower-defense": {
    remoteEntry: "assets/games/tower-defense/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Legacy Defenders",
    popular: true,
    gameId: "GAME_015",
    assets: [],
  },
  "stackibility-stack": {
    remoteEntry: "assets/games/stackibility-stack/index.js",
    exposedModule: "./GameEntry",
    type: "vanilla",
    displayName: "Stackibility Stack",
    popular: true,
    gameId: "GAME_016",
    assets: [],
  },
  "health-shield": {
    remoteEntry: "assets/games/health-shield/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Health Shield",
    popular: true,
    gameId: "GAME_017",
    assets: [],
  },
  "life-goals-bubble-shooter": {
    remoteEntry: "assets/games/life-goals-bubble-shooter/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Life Goals Bubble Shooter",
    popular: true,
    gameId: "GAME_018",
    assets: [],
  },
  "cover-word-rescue": {
    remoteEntry: "assets/games/cover-word-rescue/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Cover Word Rescue",
    popular: true,
    gameId: "GAME_019",
    assets: [],
  },
  "debt-defender": {
    remoteEntry: "assets/games/debt-defender/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Debt Defender",
    popular: true,
    gameId: "GAME_020",
    assets: [],
  },
  "shield-marble-vita": {
    remoteEntry: "assets/games/shield-marble-vita/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Shield Marble Vita",
    popular: true,
    gameId: "GAME_021",
    assets: [],
  },
  "jumbled-quest": {
    remoteEntry: "assets/games/jumbled-quest/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Jumbled Quest",
    popular: true,
    gameId: "GAME_022",
    assets: [],
  },
  "ulip-wealth-whacker": {
    remoteEntry: "assets/games/ulip-wealth-whacker/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "ULIP Wealth Whacker",
    popular: true,
    gameId: "GAME_023",
    assets: [],
  },
  "guardian-strike": {
    remoteEntry: "assets/games/guardian-strike/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Guardian Strike",
    popular: true,
    gameId: "GAME_024",
    assets: [],
  },
  "future-climb": {
    remoteEntry: "assets/games/future-climb/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Future Climb",
    popular: true,
    gameId: "GAME_025",
    assets: [],
  },
  "fortune-slice": {
    remoteEntry: "assets/games/fortune-slice/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Fortune Slice",
    popular: true,
    gameId: "GAME_026",
    assets: [],
  },
  "legacy-sweep": {
    remoteEntry: "assets/games/legacy-sweep/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Legacy Sweep",
    popular: true,
    gameId: "GAME_027",
    assets: [],
  },
  "future-sprint": {
    remoteEntry: "assets/games/future-sprint/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Future Sprint",
    popular: true,
    gameId: "GAME_028",
    assets: [],
  },
  "guardian-grid": {
    remoteEntry: "assets/games/guardian-grid/index.js",
    exposedModule: "./GameEntry",
    type: "react",
    displayName: "Guardian Grid",
    popular: true,
    gameId: "GAME_029",
    assets: [],
  },
};

const manifests = [
  path.join(ROOT_DIR, "angular-shell", "src", "assets", "federation.manifest.json"),
  path.join(ROOT_DIR, "angular-shell", "src", "assets", "federation.manifest.preprod.json"),
  path.join(ROOT_DIR, "angular-shell", "src", "assets", "federation.manifest.prod.json"),
  path.join(ROOT_DIR, "angular-shell", "src", "assets", "federation.manifest.preprod.json"),
  path.join(ROOT_DIR, "angular-shell", "src", "assets", "federation.manifest.production.json"),
];

manifests.forEach((manifestPath) => {
  fs.writeJsonSync(manifestPath, manifest, { spaces: 2 });
});
console.log("✅ Updated federation manifests with local paths!\n");
