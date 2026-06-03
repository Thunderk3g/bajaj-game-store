export const environment = {
  production: false,
  envName: 'dev',

  // ── API Endpoints ──
  apiBaseUrl: 'https://run.mocky.io/v3/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  gameBaseUrl: 'http://localhost',

  // ── Manifest ──
  manifestUrl: '/assets/federation.manifest.json',

  // ── Games (local dev ports) ──
  games: {
    'scramble-words': {
      port: 5001,
      path: '',
    },
    'life-goals': {
      port: 5002,
      path: '',
    },
    'quiz-game': {
      port: 5003,
      path: '',
    },
  },
};
