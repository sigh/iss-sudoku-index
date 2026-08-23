// Title: Sep 11, 2021: Odd/Even Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=RdXoLFAwWMY
// Source: https://tinyurl.com/48tf28tw

// Normal sudoku rules apply (rows, columns, boxes all-different; boxes are the
// standard nine 3x3 regions, so no explicit Regions/NoBoxes needed). Digits on
// grey circles must be odd (1,3,5,7,9); digits on grey squares must be even
// (2,4,6,8). There is no dedicated Odd/Even class, so each parity cell is
// encoded as a multi-value Given restricting its candidates.

const givens = [
  ['R1C2', 2], ['R1C3', 3],
  ['R2C1', 1], ['R2C4', 4],
  ['R3C4', 5],
  ['R4C2', 7], ['R4C3', 6],
  ['R6C7', 1], ['R6C8', 6],
  ['R7C6', 5],
  ['R8C6', 8], ['R8C9', 5],
  ['R9C7', 6], ['R9C8', 3],
];

// Grey circles (odd) -- drawn geometry from the puzzle's odd-cell overlay.
const oddCells = [
  'R2C6', 'R2C7', 'R2C8',
  'R3C6', 'R3C8',
  'R4C6', 'R4C7', 'R4C8',
];

// Grey squares (even) -- drawn geometry from the puzzle's even-cell overlay.
const evenCells = [
  'R6C2', 'R6C3', 'R6C4',
  'R7C2', 'R7C4',
  'R8C2', 'R8C3', 'R8C4',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map((cell) => new Given(cell, 2, 4, 6, 8)),
];
