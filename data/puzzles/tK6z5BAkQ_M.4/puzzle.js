// Title: Dec 7, 2021: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=tK6z5BAkQ_M
// Source: https://tinyurl.com/53aauwnh

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C2', 2],
  ['R1C3', 3],
  ['R1C4', 4],
  ['R1C8', 5],
  ['R2C1', 5],
  ['R2C4', 6],
  ['R2C8', 1],
  ['R2C9', 4],
  ['R3C1', 7],
  ['R3C4', 3],
  ['R4C1', 3],
  ['R4C2', 7],
  ['R4C3', 6],
  ['R4C4', 8],
  ['R4C5', 4],
  ['R4C6', 5],
  ['R4C7', 1],
  ['R5C4', 2],
  ['R5C7', 6],
  ['R6C4', 1],
  ['R6C7', 5],
  ['R7C4', 5],
  ['R7C5', 8],
  ['R7C6', 3],
  ['R7C7', 9],
  ['R8C1', 8],
  ['R8C2', 3],
  ['R9C2', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
