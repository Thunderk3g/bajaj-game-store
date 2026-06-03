export const environment = {
  production: true,
  envName: 'production',

  // ── API Endpoints ──
  apiBaseUrl: 'https://api.marketingassist.com',
  gameBaseUrl: 'https://bajajlifeinsurance.com/gamification',

  // ── Manifest ──
  manifestUrl: 'assets/federation.manifest.production.json',

  // ── Games (fallback paths for manifest-less mode) ──
  games: {
    'scramble-words': {
      path: '/scramble-words',
    },
    'life-goals': {
      path: '/life-goals',
    },
    'quiz-game': {
      path: '/quiz-game',
    },
  },
};
