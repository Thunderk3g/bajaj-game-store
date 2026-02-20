const fs = require('fs-extra');
const path = require('path');

console.log('📦 Copying game builds to Angular Shell assets...\n');

const ROOT_DIR = path.resolve(__dirname, '..');
const SHELL_GAMES_DIR = path.join(ROOT_DIR, 'angular-shell', 'src', 'assets', 'games');

// Ensure games directory exists
fs.ensureDirSync(SHELL_GAMES_DIR);

const games = [
  {
    name: 'scramble-words',
    source: path.join(ROOT_DIR, 'scramble-words', 'dist'),
    destination: path.join(SHELL_GAMES_DIR, 'scramble-words')
  },
  {
    name: 'life-goals',
    source: path.join(ROOT_DIR, 'life-goals', 'dist'),
    destination: path.join(SHELL_GAMES_DIR, 'life-goals')
  },
  {
    name: 'quiz-game',
    source: path.join(ROOT_DIR, 'quiz-game', 'dist'),
    destination: path.join(SHELL_GAMES_DIR, 'quiz-game')
  },
  {
    name: 'life-milestone-race',
    source: path.join(ROOT_DIR, 'life-milestone-race', 'dist'),
    destination: path.join(SHELL_GAMES_DIR, 'life-milestone-race')
  },
  {
    name: 'retirement-readiness-journey',
    source: path.join(ROOT_DIR, 'retirement-readiness-journey', 'dist'),
    destination: path.join(SHELL_GAMES_DIR, 'retirement-readiness-journey')
  },
  {
    name: 'financial-match-arena',
    source: path.join(ROOT_DIR, 'financial-match-arena', 'dist'),
    destination: path.join(SHELL_GAMES_DIR, 'financial-match-arena')
  }
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
      // If it's the last retry, try Strategy 2
      if (i === maxRetries - 1) break;

      console.warn(`    ⚠️ Locking issue with ${path.basename(dirPath)}. Retrying (${i + 1}/${maxRetries})...`);
      const start = Date.now();
      while (Date.now() - start < 500) { } // Wait 500ms
    }
  }

  // Strategy 2: Rename and Abandon (if delete failed)
  try {
    const trashPath = `${dirPath}_trash_${Date.now()}`;
    fs.renameSync(dirPath, trashPath);
    console.log(`    ⚠️ Moved locked folder to ${path.basename(trashPath)} to proceed.`);

    // Try to delete the trash asynchronously (fire and forget)
    fs.remove(trashPath).catch(() => { });
    return;
  } catch (renameErr) {
    // If rename also fails, we can't do much.
    console.error(`    ❌ Could not remove or move ${dirPath}. Please close any apps using it.`);
    throw renameErr;
  }
};

games.forEach(game => {
  console.log(`  ✓ Copying ${game.name}...`);

  // Remove existing if present using robust delete
  robustRemove(game.destination);

  // Copy game build
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

console.log('\n✅ All games copied to Shell assets!\n');

// Update development manifest to point to local assets
const manifestPath = path.join(ROOT_DIR, 'angular-shell', 'src', 'assets', 'federation.manifest.json');
const manifest = {
  "scramble-words": {
    "remoteEntry": "assets/games/scramble-words/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "displayName": "Scramble Words",
    "popular": false,
    "gameId": "GAME_003",
    "assets": []
  },
  "life-goals": {
    "remoteEntry": "assets/games/life-goals/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "displayName": "Life Goals Planner",
    "popular": true,
    "gameId": "GAME_001",
    "assets": [
      "assets/games/life-goals/assets/videos/business.mp4",
      "assets/games/life-goals/assets/videos/child_edu.mp4",
      "assets/games/life-goals/assets/videos/child_marriage.mp4",
      "assets/games/life-goals/assets/videos/dream_car.mp4",
      "assets/games/life-goals/assets/videos/financial_security.mp4",
      "assets/games/life-goals/assets/videos/health.mp4",
      "assets/games/life-goals/assets/videos/house.mp4",
      "assets/games/life-goals/assets/videos/retirement.mp4",
      "assets/games/life-goals/assets/videos/travel.mp4"
    ]
  },
  "quiz-game": {
    "remoteEntry": "assets/games/quiz-game/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "displayName": "Quiz Challenge",
    "popular": true,
    "gameId": "GAME_002",
    "assets": [
      "assets/games/quiz-game/assets/bajaj.png",
      "assets/games/quiz-game/assets/bg.png",
      "assets/games/quiz-game/assets/gst.png"
    ]
  },
  "life-milestone-race": {
    "remoteEntry": "assets/games/life-milestone-race/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "displayName": "Life Milestone Race",
    "popular": true,
    "gameId": "GAME_004",
    "assets": []
  },
  "retirement-readiness-journey": {
    "remoteEntry": "assets/games/retirement-readiness-journey/index.js",
    "exposedModule": "./GameEntry",
    "type": "react",
    "displayName": "Retirement Readiness Journey",
    "popular": true,
    "gameId": "GAME_005",
    "assets": []
  }
};

fs.writeJsonSync(manifestPath, manifest, { spaces: 2 });
console.log('✅ Updated federation manifest with local paths!\n');
