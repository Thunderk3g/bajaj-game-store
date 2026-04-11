export const isValidMove = (sourceTube, targetTube, capacity) => {
    // Rule 1: Source tube must not be empty
    if (sourceTube.length === 0) return { valid: false, reason: 'EMPTY_SOURCE' };

    // Rule 2: Target tube must not be full
    if (targetTube.length >= capacity) return { valid: false, reason: 'TARGET_FULL' };

    // Rule 3: Target tube must be empty OR top segment category must match source top
    if (targetTube.length > 0) {
        const sourceTop = sourceTube[sourceTube.length - 1];
        const targetTop = targetTube[targetTube.length - 1];
        if (sourceTop.category !== targetTop.category) {
            return { valid: false, reason: 'CATEGORY_MISMATCH' };
        }
    }

    return { valid: true };
};
