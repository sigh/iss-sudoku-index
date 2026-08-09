// Title: Aug 18, 2022: Renban Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=VGVN2oFFXnM
// Source: https://tinyurl.com/2p87674k

// Normal sudoku rules (default row/column/box all-different).
// Renban: each pink line's digits form a non-repeating consecutive set, in
// any order.

// Givens, transcribed from the source's per-cell values.
const givens = [
  ['R2C1', 9], ['R2C2', 7], ['R2C3', 6], ['R2C7', 1], ['R2C8', 2], ['R2C9', 3],
  ['R3C5', 2], ['R3C6', 1],
  ['R4C6', 5],
  ['R5C1', 1], ['R5C2', 4], ['R5C3', 7], ['R5C7', 8], ['R5C8', 6], ['R5C9', 5],
  ['R6C4', 4],
  ['R7C4', 9], ['R7C5', 8],
  ['R8C1', 5], ['R8C2', 8], ['R8C3', 9], ['R8C7', 2], ['R8C8', 3], ['R8C9', 4],
];

// Pink Renban lines, transcribed from the source's line list (cell order as
// drawn).
const renbanLines = [
  ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R6C5', 'R7C6', 'R8C7'],
  ['R5C4', 'R5C5', 'R5C6', 'R4C7', 'R3C7', 'R2C6', 'R2C5', 'R2C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...renbanLines.map((cells) => new Renban(...cells)),
];
