export const calculateClarityScore = (totalMoves, totalMistakes, totalSorted) => {
    // Max sortable tubes = 5 (single level with 5 category tubes)
    const MAX_SORTED = 5;

    // Base score: sorting is the primary goal — up to 80 points
    const sortingScore = (totalSorted / MAX_SORTED) * 80;

    // Efficiency bonus: up to 20 points, gentle penalties for excess moves/mistakes
    const FREE_MOVES = 30; // reasonable moves before penalty kicks in
    const movePenalty = Math.max(totalMoves - FREE_MOVES, 0) * 0.3;
    const mistakePenalty = totalMistakes * 2;
    const efficiencyBonus = Math.max(0, 20 - mistakePenalty - movePenalty);

    let score = sortingScore + efficiencyBonus;

    return Math.max(0, Math.min(100, Math.round(score)));
};
