export const resolveArchetype = (score, mistakes, moves) => {
    if (score >= 85) return 'Balanced Planner';
    if (mistakes <= 2) return 'Risk-Aware Builder';
    if (moves > 35) return 'Over-Thinker';
    return 'Unprotected Achiever';
};

export const getArchetypeDetails = (archetype) => {
    const details = {
        'Balanced Planner': {
            title: 'Balanced Planner',
            traits: 'Strategic, Foresighted, Stable',
            description: 'You have a clear vision of your financial future and take calculated steps to achieve it.',
        },
        'Risk-Aware Builder': {
            title: 'Risk-Aware Builder',
            traits: 'Cautious, Methodical, Solid',
            description: 'You prioritize security and steady growth, ensuring a firm foundation for your goals.',
        },
        'Over-Thinker': {
            title: 'Over-Thinker',
            traits: 'Analytical, Cautious, Detailed',
            description: 'You explore every option thoroughly, sometimes over-complicating what could be simple.',
        },
        'Unprotected Achiever': {
            title: 'Unprotected Achiever',
            traits: 'Ambitious, Fast-paced, Dynamic',
            description: 'You chase goals with passion, but may need to strengthen your safety net for the long haul.',
        },
    };

    return details[archetype] || details['Unprotected Achiever'];
};
