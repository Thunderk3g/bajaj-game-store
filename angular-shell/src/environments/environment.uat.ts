export const environment = {
  production: false,
  envName: 'uat',

  // ── API Endpoints ──
  apiBaseUrl: 'https://uat-api.marketingassist.com',
  gameBaseUrl: 'https://balicuat.bajajlifeinsurance.com/gamification',

  // ── Manifest ──
  manifestUrl: 'assets/federation.manifest.json',

  // ── Games (UAT paths) ──
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
