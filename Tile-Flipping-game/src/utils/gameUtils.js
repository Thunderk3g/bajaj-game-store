import { TOTAL_PAIRS } from '../constants/game';

/** Convert seconds → MM:SS */
export function formatTime(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0');
    const s = (Math.max(0, seconds) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/** Star rating based on flips used (1-5 stars) */
export function getFlipStars(flipsCount) {
    if (flipsCount <= 5) return 5;
    if (flipsCount <= 11) return 4;
    if (flipsCount <= 17) return 3;
    if (flipsCount <= 23) return 2;
    if (flipsCount <= 29) return 1;
    return 0;
}

/** Star rating based on score (original 3-star logic) - keeping for compatibility */
export function getStars(score) {
    if (score === TOTAL_PAIRS) return 3;
    if (score >= Math.ceil(TOTAL_PAIRS * 0.6)) return 2;
    if (score > 0) return 1;
    return 0;
}

/** Get scenario-specific text for result screen */
export function getScoreScenario(score) {
    if (score === TOTAL_PAIRS) {
        return {
            scenario: 1,
            headline: "You remembered what matters the most",
            scoreDisplay: "100%",
            body: "In life, protecting your responsibilities is even more powerful",
            cta: "Do not forget to protect your financial responsibilities. Connect with our relationship manager now !"
        };
    }
    if (score <= 4) {
        return {
            scenario: 2,
            headline: "Some things slipped away",
            scoreDisplay: `${score} / 8`,
            body: "In a game, it’s okay to forget. In life, forgetting to protect what matters can be costly",
            cta: "Do not forget to protect your financial responsibilities. Connect with our relationship manager now !"
        };
    }
    // Scenario 3: 5-7 pairs
    return {
        scenario: 3,
        headline: `You remembered most of it`,
        scoreDisplay: `${score} / 8`,
        body: "Almost complete. But in life, ‘almost protected’ is still exposed",
        cta: "Do not forget to protect your financial responsibilities. Connect with our relationship manager now !"
    };
}

/** Motivational message based on score */
export function getScoreMessage(score) {
    const scenario = getScoreScenario(score);
    return scenario.headline;
}

/** Dynamic hint based on pairs found */
export function getHintText(matchedPairs) {
    const remaining = TOTAL_PAIRS - matchedPairs;
    if (matchedPairs === 0) return '🎯 Find all 8 matching pairs!';
    if (remaining === 0) return '🎉 You found all pairs!';
    if (remaining <= 2) return `🔥 Almost there! ${remaining} pair${remaining > 1 ? 's' : ''} left!`;
    if (matchedPairs >= 5) return `⭐ Great focus! ${remaining} more to go!`;
    return `🧠 Keep going! ${remaining} pair${remaining > 1 ? 's' : ''} remaining`;
}
