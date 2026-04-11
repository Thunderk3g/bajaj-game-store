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

export const isTubeSorted = (tube, capacity, expectedCategory = null) => {
    if (tube.length === 0) return false;
    if (tube.length !== capacity) return false;

    const actualCategory = tube[0].category;
    const isUniform = tube.every(segment => segment.category === actualCategory);

    if (!isUniform) return false;

    // If an expected category is provided, it must match
    if (expectedCategory && actualCategory !== expectedCategory) return false;

    return true;
};

export const checkWin = (tubes, activeCategoriesCount, capacity) => {
    const categoryMapping = ['growth', 'safety', 'resp', 'risk', 'asset'];

    // Each of the first N tubes must be sorted with its designated category
    for (let i = 0; i < activeCategoriesCount; i++) {
        const expectedCat = categoryMapping[i];
        if (!isTubeSorted(tubes[i], capacity, expectedCat)) {
            return false;
        }
    }
    return true;
};
