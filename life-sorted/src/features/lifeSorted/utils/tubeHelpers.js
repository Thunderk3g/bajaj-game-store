import { LIFE_ELEMENTS_ARRAY } from '../constants/lifeElements';

export const generateInitialTubes = (levelConfig) => {
    const { tubesCount, emptyTubes, elementsToInclude, capacity } = levelConfig;
    const activeTubesCount = tubesCount - emptyTubes;

    const elements = LIFE_ELEMENTS_ARRAY.filter(el => elementsToInclude.includes(el.id));
    const categoriesPresent = [...new Set(elements.map(e => e.category))];
    const segmentPool = [];

    // Ensure exactly 4 segments per category
    categoriesPresent.forEach(cat => {
        const elementsInCat = elements.filter(e => e.category === cat);
        for (let i = 0; i < capacity; i++) {
            // Cycle through available elements in the category to make exactly 4 segments
            const element = elementsInCat[i % elementsInCat.length];
            segmentPool.push({ ...element, instanceId: `${element.id}-${i}` });
        }
    });

    // Shuffle the pool
    for (let i = segmentPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [segmentPool[i], segmentPool[j]] = [segmentPool[j], segmentPool[i]];
    }

    const tubes = Array.from({ length: tubesCount }, () => []);

    // Distribute into tubes (only the first 'activeTubesCount' tubes get elements initially)
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
    if (tube.length === 0) return false; // Empty tubes are holding spaces, not sorted
    if (tube.length !== capacity) return false;

    const category = tube[0].category;
    return tube.every(segment => segment.category === category);
};

export const checkWin = (tubes, activeCategoriesCount, capacity) => {
    // Only check the first N tubes (category tubes). The last tubes are utility/empty tubes for holding.
    const categoryTubes = tubes.slice(0, activeCategoriesCount);
    const completedTubes = categoryTubes.filter(tube => tube.length === capacity && isTubeSorted(tube, capacity));
    return completedTubes.length === activeCategoriesCount;
};
