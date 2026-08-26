// Title: 6/11/22: B1G3 Countdown: 2...
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/mu3ayxsw

// Normal sudoku rules apply. Grey regions are clones, and must contain the
// same digits in the same relative positions.
// Nothing is omitted.

const givens = [
  new Given('R1C6', 1), new Given('R2C5', 2), new Given('R3C4', 3),
  new Given('R5C2', 4), new Given('R6C1', 5), new Given('R6C4', 2),
];

// One 9-cell clone pair (payload `clone` entry's `cells`/`cloneCells`
// arrays), listed in matching order: both arrays share the same
// cell-to-cell offsets from their first entry, so no rotation/reflection
// applies -- index i of regionA pairs with index i of regionB.
const regionA = [
  'R1C2', 'R1C3', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R5C1', 'R5C2',
];
const regionB = [
  'R2C5', 'R2C6', 'R3C6', 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R6C4', 'R6C5',
];

// One SameValues(2, ...) per shared offset: pins each position's value equal
// across the two regions, i.e. positional equality (not just a matching
// multiset over the whole 9-cell region).
const clones = regionA.map((a, i) => new SameValues(2, a, regionB[i]));

return [
  new Shape('6x6'),
  ...givens,
  ...clones,
];
