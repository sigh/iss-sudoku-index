// Title: Feb. 21, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=HaK08DW5pJE
// Source: https://tinyurl.com/yuxhdz7r

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 9],
  ['R1C2', 7],
  ['R1C4', 5],
  ['R1C5', 4],
  ['R2C8', 1],
  ['R2C9', 2],
  ['R3C1', 4],
  ['R3C4', 6],
  ['R3C5', 3],
  ['R4C1', 6],
  ['R4C7', 8],
  ['R5C3', 2],
  ['R5C7', 5],
  ['R6C3', 5],
  ['R6C9', 7],
  ['R7C5', 6],
  ['R7C6', 7],
  ['R7C9', 5],
  ['R8C1', 8],
  ['R8C2', 9],
  ['R9C5', 9],
  ['R9C6', 8],
  ['R9C8', 2],
  ['R9C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
