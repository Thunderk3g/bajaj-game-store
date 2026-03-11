export const calculateClarityScore = (totalMoves, totalMistakes, totalSorted) => {
    // Max sortable tubes = 5 (single level with 5 category tubes)
    const MAX_SORTED = 5;

    // Base score: sorting gives up to 60 points
    const sortingScore = (totalSorted / MAX_SORTED) * 60;

    // Efficiency bonus: up to 40 points, reduced by penalties
    const movePenalty = Math.max(totalMoves - 20, 0) * 0.5;
    const mistakePenalty = totalMistakes * 3;
    const efficiencyBonus = Math.max(0, 40 - mistakePenalty - movePenalty);

    let score = sortingScore + efficiencyBonus;

    return Math.max(0, Math.min(100, Math.round(score)));
};
