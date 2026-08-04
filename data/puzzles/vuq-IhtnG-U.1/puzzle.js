// Title: 2/16/23: Law and Order 66
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vuq-IhtnG-U
// Source: https://tinyurl.com/5n94jnhx

// Normal sudoku rules apply.
// Clone: two grey-outlined region pairs share a shape; matching relative
// positions within each pair hold the same digit. Each pair below is
// index-aligned so that each cell shares the same row/col offset from its
// own region's first cell as its partner does from the other region's first
// cell, verified by hand. Encoded as one SameValues(2, a, b) per matched
// cell pair (pairwise value equality).

// Clone pair A: 12-cell "picture frame" (4x4 minus interior 2x2) at
// R1-4C1-4, clones onto R5-8C5-8.
const CLONE_A = [
  ['R1C1', 'R5C5'], ['R1C2', 'R5C6'], ['R1C3', 'R5C7'], ['R1C4', 'R5C8'],
  ['R2C1', 'R6C5'], ['R2C4', 'R6C8'],
  ['R3C1', 'R7C5'], ['R3C4', 'R7C8'],
  ['R4C1', 'R8C5'], ['R4C2', 'R8C6'], ['R4C3', 'R8C7'], ['R4C4', 'R8C8'],
];

// Clone pair B: 2x2 block at R2-3C6-7, clones onto R6-7C2-3.
const CLONE_B = [
  ['R2C6', 'R6C2'], ['R2C7', 'R6C3'],
  ['R3C6', 'R7C2'], ['R3C7', 'R7C3'],
];

return [
  new Shape('9x9'),

  // Givens, transcribed from the drawn grid.
  new Given('R1C9', 8),
  new Given('R2C2', 1),
  new Given('R2C3', 2),
  new Given('R3C2', 3),
  new Given('R3C3', 4),
  new Given('R4C6', 8),
  new Given('R4C8', 2),
  new Given('R6C4', 9),
  new Given('R6C6', 4),
  new Given('R6C7', 5),
  new Given('R7C6', 6),
  new Given('R7C7', 7),
  new Given('R8C4', 1),
  new Given('R9C1', 9),

  ...[...CLONE_A, ...CLONE_B].map(([a, b]) => new SameValues(2, a, b)),
];
