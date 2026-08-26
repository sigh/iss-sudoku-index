// Title: Three Great Sudoku Techniques
// Author: 
// Video: https://www.youtube.com/watch?v=1T6WlU4kBy0
// Source: https://cracking-the-cryptic.web.app/sudoku/6tT7bNDfQj

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C8', 4],
  ['R1C9', 5],
  ['R2C1', 4],
  ['R2C4', 7],
  ['R3C2', 5],
  ['R3C3', 7],
  ['R3C7', 3],
  ['R3C8', 8],
  ['R4C1', 8],
  ['R4C4', 5],
  ['R4C5', 9],
  ['R4C7', 4],
  ['R5C3', 6],
  ['R5C5', 2],
  ['R5C7', 5],
  ['R6C3', 9],
  ['R6C5', 7],
  ['R6C6', 3],
  ['R6C9', 8],
  ['R7C2', 1],
  ['R7C3', 5],
  ['R7C7', 8],
  ['R7C8', 6],
  ['R8C6', 8],
  ['R8C9', 7],
  ['R9C1', 9],
  ['R9C2', 7],
  ['R9C9', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
