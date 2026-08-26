// Title: Sep 23, 2021: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=rnZRKAvcfBk
// Source: https://tinyurl.com/ehtww6hs

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C3', 2],
  ['R1C4', 3],
  ['R1C6', 4],
  ['R1C7', 5],
  ['R1C9', 6],
  ['R3C1', 5],
  ['R3C3', 7],
  ['R3C4', 8],
  ['R3C7', 1],
  ['R3C9', 2],
  ['R4C1', 6],
  ['R4C7', 8],
  ['R4C9', 7],
  ['R6C1', 2],
  ['R6C3', 5],
  ['R6C9', 9],
  ['R7C1', 4],
  ['R7C3', 6],
  ['R7C6', 1],
  ['R7C7', 3],
  ['R7C9', 5],
  ['R9C1', 3],
  ['R9C3', 8],
  ['R9C4', 5],
  ['R9C6', 2],
  ['R9C7', 6],
  ['R9C9', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
