/**
 * Game Service — placeholder for game lifecycle API calls.
 */

/**
 * Start a new game session.
 */
export async function startGameSession() {
    return {
        success: true,
        gameId: `bomb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        startedAt: new Date().toISOString(),
    };
}

/**
 * Complete a game session with final score.
 */
export async function completeGameSession() {
    return { success: true };
}
