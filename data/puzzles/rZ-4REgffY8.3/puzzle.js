// Title: Mar 26, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=rZ-4REgffY8
// Source: https://tinyurl.com/mr2hu5ur

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C5', 5],
  ['R1C6', 6],
  ['R1C9', 4],
  ['R2C1', 1],
  ['R2C2', 2],
  ['R2C9', 8],
  ['R3C1', 3],
  ['R3C2', 4],
  ['R3C4', 8],
  ['R3C5', 1],
  ['R4C7', 5],
  ['R5C3', 1],
  ['R5C5', 4],
  ['R5C7', 6],
  ['R6C3', 2],
  ['R7C5', 8],
  ['R7C6', 3],
  ['R7C8', 6],
  ['R7C9', 7],
  ['R8C1', 7],
  ['R8C8', 8],
  ['R8C9', 9],
  ['R9C1', 9],
  ['R9C4', 1],
  ['R9C5', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
