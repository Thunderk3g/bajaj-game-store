export const isValidMove = (sourceTube, targetTube, capacity) => {
    // Rule 1: Source tube must not be empty
    if (sourceTube.length === 0) return { valid: false, reason: 'EMPTY_SOURCE' };

    // Rule 2: Target tube must not be full
    if (targetTube.length >= capacity) return { valid: false, reason: 'TARGET_FULL' };

    // USER REQUEST: "fix that we can fill anything untill the tube is filled with one color"
    // Relaxed Rule 3: Target tube can accept ANY color as long as there is space.
    // (Old rule was: Target tube must be empty OR top segment category must match source top)

    return { valid: true };
};
