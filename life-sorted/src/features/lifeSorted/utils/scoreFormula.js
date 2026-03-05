export const calculateClarityScore = (totalMoves, totalMistakes, totalSorted) => {
    // score = clamp(35, 100, 100 - (mistakes * 2) - (max(moves - 20, 0) * 0.4) - ((totalSorted / 15) * 20))
    // Wait, the prompt formula has a minus for sorted? That seems odd.
    // Re-reading prompt: "score = clamp(35, 100, 100 - (mistakes * 2) - (max(moves - 20, 0) * 0.4) - ((totalSorted / 15) * 20) )"
    // Actually, usually sorted should ADD to score. But let's follow the prompt's mathematical expression literally first.
    // Wait, if totalSorted is 15, then (15/15)*20 = 20. So it SUBTRACTS 20? 
    // Maybe it's a typo in the prompt and it should be based on what's NOT sorted?
    // Let's look at the archetype logic. 85+ is Balanced Planner.
    // If I have 0 mistakes and 20 moves, and 15 sorted, the score would be 100 - 0 - 0 - 20 = 80.
    // To get 85+, I'd need even fewer moves or mistakes, or the formula is slightly different.
    // Let's stick to the prompt's logic but maybe it meant (1 - totalSorted/15) * 20?
    // No, I will follow the prompt exactly as requested.

    const movePenalty = Math.max(totalMoves - 20, 0) * 0.4;
    const mistakePenalty = totalMistakes * 2;
    const sortedPenalty = (totalSorted / 15) * 20;

    let score = 100 - mistakePenalty - movePenalty - sortedPenalty;

    return Math.max(35, Math.min(100, Math.round(score)));
};
