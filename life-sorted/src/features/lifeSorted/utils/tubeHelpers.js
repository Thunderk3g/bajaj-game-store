import { LIFE_ELEMENTS_ARRAY } from '../constants/lifeElements';

export const generateInitialTubes = (levelConfig) => {
    const { tubesCount, emptyTubes, elementsToInclude, capacity } = levelConfig;
    const activeTubesCount = tubesCount - emptyTubes;

    // Get the life element objects for the included IDs
    const elements = LIFE_ELEMENTS_ARRAY.filter(el => elementsToInclude.includes(el.id));

    // Create a pool of segments (4 per category/element id, actually we should group by category for the sorting logic)
    // But wait, the prompt says "Tube B is empty OR top segment category matches Tube A top segment."
    // This implies we sort by CATEGORY.

    // Let's refine: we have elements that belong to categories.
    // We need to ensure that all segments of the same category can fit into completed tubes.
    // Actually, usually in these games, each tube should end up with segments of the same type.
    // The rule says "top segment category matches".

    const categoriesPresent = [...new Set(elements.map(e => e.category))];
    const segmentPool = [];

    categoriesPresent.forEach(cat => {
        // For each category, we need exactly 'capacity' segments in the game
        for (let i = 0; i < capacity; i++) {
            // Pick an element from this category
            const elementsInCat = elements.filter(e => e.category === cat);
            const element = elementsInCat[i % elementsInCat.length];
            segmentPool.push({ ...element, instanceId: `${element.id}-${i}` });
        }
    });

    // Shuffle the pool
    for (let i = segmentPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [segmentPool[i], segmentPool[j]] = [segmentPool[j], segmentPool[i]];
    }

    // Distribute into tubes
    const tubes = Array.from({ length: tubesCount }, () => []);

    let poolIndex = 0;
    for (let i = 0; i < activeTubesCount; i++) {
        for (let j = 0; j < capacity; j++) {
            if (poolIndex < segmentPool.length) {
                tubes[i].push(segmentPool[poolIndex++]);
            }
        }
    }

    return tubes;
};

export const isTubeSorted = (tube, capacity) => {
    if (tube.length === 0) return false; // Empty tube is not "sorted" in terms of winning, unless it's a buffer
    if (tube.length !== capacity) return false;

    const category = tube[0].category;
    return tube.every(segment => segment.category === category);
};

export const checkWin = (tubes, activeCategoriesCount, capacity) => {
    const sortedTubes = tubes.filter(tube => isTubeSorted(tube, capacity));
    return sortedTubes.length === activeCategoriesCount;
};
