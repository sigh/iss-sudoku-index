// Title: March 5, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=VrmINT5PAyk
// Source: https://tinyurl.com/yc4smp2y

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C2', 2],
  ['R1C3', 3],
  ['R2C2', 4],
  ['R2C3', 5],
  ['R2C4', 1],
  ['R3C3', 6],
  ['R3C4', 7],
  ['R3C5', 4],
  ['R3C7', 1],
  ['R3C8', 3],
  ['R4C8', 6],
  ['R4C9', 7],
  ['R6C1', 4],
  ['R6C2', 5],
  ['R7C2', 8],
  ['R7C3', 7],
  ['R7C5', 5],
  ['R7C6', 2],
  ['R7C7', 4],
  ['R8C6', 1],
  ['R8C7', 6],
  ['R8C8', 7],
  ['R9C7', 2],
  ['R9C8', 8],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
