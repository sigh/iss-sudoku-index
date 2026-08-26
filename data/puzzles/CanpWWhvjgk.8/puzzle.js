// Title: 6/11/22: B1G3 Countdown: 3...
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/yntk3jt9

// Standard 6x6 sudoku givens (2x3 boxes). Grey regions are clones: they must
// contain the same digits in the same relative positions, i.e. each cell in
// the first region equals the cell at the corresponding position in the
// second region.
const givens = [
  ['R1C3', 3], ['R1C6', 1],
  ['R2C5', 2],
  ['R3C4', 3],
  ['R5C2', 4],
  ['R6C1', 5],
];

// Clone region cell lists, index-aligned by relative position within each
// region's shape.
const cloneA = [
  'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C2', 'R3C3', 'R4C3', 'R5C1', 'R5C2', 'R5C3',
];
const cloneB = [
  'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C5', 'R4C6', 'R5C6', 'R6C4', 'R6C5', 'R6C6',
];

return [
  new Shape('6x6'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cloneA.map((cell, i) => new SameValues(2, cell, cloneB[i])),
];
