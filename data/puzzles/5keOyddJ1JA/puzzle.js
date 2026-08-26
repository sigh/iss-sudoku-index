// Title: Three Diabolical Sudoku Techniques
// Author: 
// Video: https://www.youtube.com/watch?v=5keOyddJ1JA
// Source: https://cracking-the-cryptic.web.app/sudoku/T8qj67f8Mg

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 8],
  ['R1C5', 6],
  ['R1C9', 9],
  ['R2C2', 2],
  ['R2C5', 4],
  ['R2C8', 8],
  ['R3C4', 1],
  ['R3C6', 9],
  ['R4C3', 1],
  ['R4C7', 4],
  ['R5C1', 4],
  ['R5C2', 6],
  ['R5C9', 5],
  ['R6C3', 5],
  ['R6C5', 9],
  ['R6C7', 6],
  ['R7C3', 9],
  ['R7C4', 5],
  ['R7C6', 6],
  ['R7C7', 8],
  ['R8C2', 7],
  ['R8C5', 2],
  ['R8C8', 9],
  ['R9C1', 2],
  ['R9C5', 1],
  ['R9C9', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
