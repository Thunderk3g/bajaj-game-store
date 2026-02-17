export const environment = {
  production: true,
  envName: 'prod',

  // ── API Endpoints ──
  apiBaseUrl: 'https://api.marketingassist.com',
  gameBaseUrl: 'https://balicuat.bajajlifeinsurance.com/gamification',

  // ── Manifest ──
  manifestUrl: 'assets/federation.manifest.json',

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
