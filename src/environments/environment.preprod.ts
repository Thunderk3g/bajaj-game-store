export const environment = {
    production: false,
    envName: 'preprod',

    // ── API Endpoints ──
    apiBaseUrl: 'https://bajajuat2-api.marketingassist.com',
    gameBaseUrl: 'https://balicuat.bajajlifeinsurance.com/gamification',

    // ── Manifest ──
    manifestUrl: 'assets/federation.manifest.preprod.json',

    // ── Games (preprod paths) ──
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
