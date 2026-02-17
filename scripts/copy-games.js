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
    source: path.join(ROOT_DIR, 'Scramble-Words', 'dist'),
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
  }
];

games.forEach(game => {
  console.log(`  ✓ Copying ${game.name}...`);

  // Remove existing if present
  if (fs.existsSync(game.destination)) {
    fs.removeSync(game.destination);
  }

  // Copy game build
  if (fs.existsSync(game.source)) {
    fs.copySync(game.source, game.destination);
    console.log(`    → ${game.destination}`);
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
  }
};

fs.writeJsonSync(manifestPath, manifest, { spaces: 2 });
console.log('✅ Updated federation manifest with local paths!\n');
