// Title: Jul 10, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=PHOuWUax7J8
// Source: https://tinyurl.com/2zyvw28b

// Normal sudoku rules apply (standard 3x3 boxes, rows/columns/boxes
// all-different -- ISS default). No other clues; the payload carries givens
// only.
const givens = [
  ['R1C3', 1], ['R1C4', 5], ['R1C5', 9],
  ['R2C3', 2], ['R2C4', 1], ['R2C5', 7],
  ['R3C8', 4], ['R3C9', 3],
  ['R4C8', 8], ['R4C9', 4],
  ['R5C1', 6], ['R5C2', 5], ['R5C8', 1], ['R5C9', 7],
  ['R6C1', 4], ['R6C2', 3],
  ['R7C1', 7], ['R7C2', 8],
  ['R8C5', 6], ['R8C6', 1], ['R8C7', 5],
  ['R9C5', 4], ['R9C6', 2], ['R9C7', 6],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
