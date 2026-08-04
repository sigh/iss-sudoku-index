// Title: April 16, 2023: Killer Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=WlxWJ3pPtLY
// Source: https://tinyurl.com/43mc486z

// Normal sudoku rules apply (default row/column/box all-different).
// Killer cages: digits in a cage do not repeat and must sum to the
// indicated total. No givens are drawn.

// Cages transcribed from the payload's `killercage` array (cells, sum).
const cages = [
  ['R1C1', 'R1C2', 'R2C1', 6],
  ['R1C3', 'R1C4', 'R2C3', 10],
  ['R1C6', 'R1C7', 'R2C7', 14],
  ['R1C8', 'R1C9', 'R2C9', 23],
  ['R3C1', 'R3C2', 'R4C1', 17],
  ['R3C3', 'R3C4', 'R4C3', 21],
  ['R3C6', 'R4C6', 'R4C7', 14],
  ['R3C8', 'R3C9', 'R4C9', 21],
  ['R6C1', 'R7C1', 'R7C2', 20],
  ['R6C3', 'R6C4', 'R7C4', 18],
  ['R6C7', 'R7C6', 'R7C7', 17],
  ['R6C9', 'R7C8', 'R7C9', 17],
  ['R8C1', 'R9C1', 'R9C2', 24],
  ['R8C3', 'R9C3', 'R9C4', 12],
  ['R8C7', 'R9C6', 'R9C7', 9],
  ['R8C9', 'R9C8', 'R9C9', 7],
].map(([a, b, c, sum]) => new Cage(sum, a, b, c));

return [
  new Shape('9x9'),
  ...cages,
];
