// BlockSpawner.js – block type definitions + factory
// 5 architectural building types per design (atoms.jsx ASSETS).
// Bajaj Life palette + 2 supporting building tints. Squarer aspect (h=50)
// matches the design's playable prototype.

// 8 life-stage buildings — each represents a typical purchase milestone:
//   School (education), Cottage (first home), Apartment (raising a family),
//   Townhouse (settled family), Garage (car), Hospital (health),
//   Office (career), Bank (savings & wealth).
export const BLOCK_TYPES = [
    { type: 'cottage',   iconType: 'cottage',   label: 'Cottage',   color: '#3B8DD4', borderColor: '#1E6CB6' },
    { type: 'hospital',  iconType: 'hospital',  label: 'Hospital',  color: '#F26922', borderColor: '#C44D10' },
    { type: 'townhouse', iconType: 'townhouse', label: 'Townhouse', color: '#005BAC', borderColor: '#003E7A' },
    { type: 'garage',    iconType: 'garage',    label: 'Garage',    color: '#7B5BB6', borderColor: '#5C4290' },
    { type: 'school',    iconType: 'school',    label: 'School',    color: '#00897B', borderColor: '#00665C' },
    { type: 'apartment', iconType: 'apartment', label: 'Apartment', color: '#5B7CD4', borderColor: '#3D5BAC' },
    { type: 'office',    iconType: 'office',    label: 'Office',    color: '#455A64', borderColor: '#2C3E47' },
    { type: 'bank',      iconType: 'bank',      label: 'Bank',      color: '#BFA181', borderColor: '#8E7253' },
];

let typeIndex = 0;

/**
 * Create a new block object (not yet placed).
 */
export function spawnBlock(widthOverride = null) {
    const def = BLOCK_TYPES[typeIndex % BLOCK_TYPES.length];
    typeIndex++;

    return {
        ...def,
        width: widthOverride ?? 72,
        height: 60,
        x: 0,
        y: 0,
    };
}


export function resetBlockIndex() { typeIndex = 0; }
