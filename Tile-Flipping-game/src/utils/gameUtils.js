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

/** Motivational message based on score */
export function getScoreMessage(score) {
    if (score === TOTAL_PAIRS) return '🏆 Perfect! You matched all pairs! Just like a complete insurance portfolio — nothing left uncovered.';
    if (score >= 6) return '🌟 Excellent! Almost perfect! A few gaps left — just like your insurance needs a quick review.';
    if (score >= 4) return '👍 Good effort! You\'re on the right track. Let\'s make sure your family stays fully protected.';
    if (score >= 2) return '💡 Not bad! A little more practice — just like building a strong insurance habit takes time.';
    return '🎯 Keep trying! Every expert started somewhere. Let\'s help you find the right plan to get started.';
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
