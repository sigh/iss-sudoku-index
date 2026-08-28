// Title: Dec. 17, 2021: X-23
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Y3HQYbdPh7o
// Source: https://tinyurl.com/y86zhxv7

// Normal sudoku rules apply (default row/column/box all-different).
// Orange regions are clones, and must contain the same digits in the same
// orientation. Digits in cells separated by an X sum to 10. No negative
// constraint: unmarked orthogonally adjacent pairs may also sum to 10, so no
// StrictXV is added.
//
// The orange (#FFE060) shading forms six disjoint, unrotated 2x2 blocks.
// Since every block has the same shape and offsets, "same orientation" means
// the cell at each of
// the four relative positions (top-left/top-right/bottom-left/bottom-right)
// must hold the same digit across all six blocks. Each position group below
// is encoded as one SameValues(6, ...) call, forcing all six cells in that
// group to be equal (a 6-way generalization of the cell-wise clone pattern:
// numSets equal to cell count makes every set a singleton, so all singleton
// values must match).
const cloneTopLeft = ['R1C4', 'R2C7', 'R3C1', 'R6C8', 'R7C2', 'R8C5'];
const cloneTopRight = ['R1C5', 'R2C8', 'R3C2', 'R6C9', 'R7C3', 'R8C6'];
const cloneBottomLeft = ['R2C4', 'R3C7', 'R4C1', 'R7C8', 'R8C2', 'R9C5'];
const cloneBottomRight = ['R2C5', 'R3C8', 'R4C2', 'R7C9', 'R8C3', 'R9C6'];

return [
  new Shape('9x9'),

  // Givens (source: grid[row][col].value)
  new Given('R1C1', 1),
  new Given('R1C9', 2),
  new Given('R3C6', 5),
  new Given('R5C5', 9),
  new Given('R7C4', 5),
  new Given('R9C1', 4),
  new Given('R9C9', 3),

  // X clues: digits sum to 10 (source: xv array, all entries value "X").
  new X('R2C1', 'R3C1'),
  new X('R9C5', 'R9C4'),
  new X('R1C6', 'R1C5'),
  new X('R6C2', 'R7C2'),
  new X('R3C7', 'R4C7'),
  new X('R7C9', 'R8C9'),

  // Clone regions: same digit at each relative position across all six
  // orange 2x2 blocks (see comment above).
  new SameValues(cloneTopLeft.length, ...cloneTopLeft),
  new SameValues(cloneTopRight.length, ...cloneTopRight),
  new SameValues(cloneBottomLeft.length, ...cloneBottomLeft),
  new SameValues(cloneBottomRight.length, ...cloneBottomRight),
];
