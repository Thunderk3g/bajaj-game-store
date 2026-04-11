import { SCORE_CATEGORIES, INITIAL_SCORE } from '../constants/lifeStages';

/**
 * Clamp a score between 0 and 100.
 * @param {number} score
 * @returns {number}
 */
export function clampScore(score) {
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate updated score after a decision.
 * Applies compounding penalty for consecutive exposed high-severity events.
 *
 * @param {number} currentScore
 * @param {number} impact - the delta from severityImpact
 * @param {boolean} isExposedHighSeverity - whether this is an exposed high-severity event
 * @param {number} consecutiveExposedHigh - count of consecutive exposed high-severity events
 * @returns {{ newScore: number, appliedDelta: number }}
 */
export function calculateScore(currentScore, impact, isExposedHighSeverity, consecutiveExposedHigh) {
    const delta = impact;
    const newScore = clampScore(currentScore + delta);
    return { newScore, appliedDelta: delta };
}

/**
 * Determine protection category based on score.
 * @param {number} score
 * @returns {{ label: string, color: string, key: string }}
 */
export function getProtectionCategory(score) {
    if (score <= SCORE_CATEGORIES.LOW.max) {
        return { label: SCORE_CATEGORIES.LOW.label, color: SCORE_CATEGORIES.LOW.color, key: 'LOW' };
    }
    if (score <= SCORE_CATEGORIES.MEDIUM.max) {
        return { label: SCORE_CATEGORIES.MEDIUM.label, color: SCORE_CATEGORIES.MEDIUM.color, key: 'MEDIUM' };
    }
    return { label: SCORE_CATEGORIES.HIGH.label, color: SCORE_CATEGORIES.HIGH.color, key: 'HIGH' };
}

/**
 * Calculate final normalized score (0-100).
 * @param {number} rawScore
 * @returns {number}
 */
export function normalizeScore(rawScore) {
    return clampScore(Math.round(rawScore));
}

/**
 * Generate risk summary from timeline decisions.
 * @param {Array} timeline
 * @returns {Array<string>}
 */
export function generateRiskGaps(timeline) {
    return timeline
        .filter((entry) => entry.decision === 'exposed')
        .map((entry) => `${entry.stage}: ${entry.title} (${entry.severity})`);
}
