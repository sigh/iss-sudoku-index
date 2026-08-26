// Title: Techniques for Hard Sudoku
// Author: 
// Video: https://www.youtube.com/watch?v=sYBz4TZH-Co
// Source: https://cracking-the-cryptic.web.app/sudoku/RjP3PL8dbt

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R2C4', 6],
  ['R3C2', 6],
  ['R3C4', 9],
  ['R3C5', 3],
  ['R3C6', 5],
  ['R4C3', 2],
  ['R4C4', 3],
  ['R4C5', 4],
  ['R4C8', 6],
  ['R5C1', 3],
  ['R5C6', 1],
  ['R5C9', 2],
  ['R6C8', 8],
  ['R6C9', 4],
  ['R7C2', 5],
  ['R7C5', 6],
  ['R8C3', 1],
  ['R8C6', 2],
  ['R8C8', 9],
  ['R9C1', 8],
  ['R9C8', 7],
  ['R9C9', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
