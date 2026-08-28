// Title: August 21, 2021: Diff Diffs
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=7sWnbrADeWo
// Source: https://tinyurl.com/afupswj8

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, from the default
// Shape('9x9')). Each drawn dot is a white (difference) dot whose printed
// number is the required difference between its two cells -- not the fixed
// diff=1 of a plain Kropki white dot -- so every dot below is read
// individually off the payload's `difference` array rather than assumed.
// Dots bind adjacent cell pairs only; none here spans more than one edge.

// A printed difference of 1 is exactly the native Kropki white dot
// (|a-b|=1); every other printed difference needs a custom pairwise
// relation, shared by key across all dots with that value.
const diffKey = (n) => Pair.fnToKey((a, b) => Math.abs(a - b) === n, 9);

// [cellA, cellB, printed difference] -- transcribed from the puzzle's
// difference-dot list, grouped by row/column chain.
const dots = [
  // Row 5, full horizontal chain, differences rising 1..8 left to right.
  ['R5C1', 'R5C2', 1], ['R5C2', 'R5C3', 2], ['R5C3', 'R5C4', 3],
  ['R5C4', 'R5C5', 4], ['R5C5', 'R5C6', 5], ['R5C6', 'R5C7', 6],
  ['R5C7', 'R5C8', 7], ['R5C8', 'R5C9', 8],

  // Column 9, two chains (no dot between R5C9 and R6C9).
  ['R1C9', 'R2C9', 2], ['R2C9', 'R3C9', 2], ['R3C9', 'R4C9', 2],
  ['R4C9', 'R5C9', 2],
  ['R6C9', 'R7C9', 2], ['R7C9', 'R8C9', 2], ['R8C9', 'R9C9', 2],

  // Row 1 (no dot between C6 and C7).
  ['R1C1', 'R1C2', 3], ['R1C2', 'R1C3', 3], ['R1C3', 'R1C4', 1],
  ['R1C4', 'R1C5', 3], ['R1C5', 'R1C6', 3],
  ['R1C7', 'R1C8', 3], ['R1C8', 'R1C9', 3],

  // Row 9 (no dot between C3 and C4).
  ['R9C1', 'R9C2', 3], ['R9C2', 'R9C3', 3],
  ['R9C4', 'R9C5', 3], ['R9C5', 'R9C6', 3], ['R9C6', 'R9C7', 1],
  ['R9C7', 'R9C8', 3], ['R9C8', 'R9C9', 3],

  // Column 1, three chains (no dot between R4C1/R5C1 or R7C1/R8C1).
  ['R1C1', 'R2C1', 2], ['R2C1', 'R3C1', 2], ['R3C1', 'R4C1', 2],
  ['R5C1', 'R6C1', 2], ['R6C1', 'R7C1', 2],
  ['R8C1', 'R9C1', 2],
];

const dotPairs = dots.map(([a, b, n]) =>
  n === 1 ? new WhiteDot(a, b) : new Pair(diffKey(n), `diff ${n}`, a, b));

return [
  new Shape('9x9'),

  // Givens, all in the centre box.
  new Given('R4C4', 6),
  new Given('R4C6', 5),
  new Given('R6C4', 4),
  new Given('R6C6', 9),

  ...dotPairs,
];
