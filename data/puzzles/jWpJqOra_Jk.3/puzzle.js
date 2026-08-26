// Title: August 3, 2021: 129 Snowflake
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=jWpJqOra_Jk
// Source: https://tinyurl.com/zdevva6w

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C4', 1],
  ['R2C2', 2],
  ['R2C4', 3],
  ['R2C6', 4],
  ['R2C8', 5],
  ['R3C3', 6],
  ['R3C5', 7],
  ['R3C7', 8],
  ['R4C1', 9],
  ['R4C3', 1],
  ['R4C4', 2],
  ['R5C1', 3],
  ['R5C2', 4],
  ['R5C5', 5],
  ['R5C8', 6],
  ['R5C9', 7],
  ['R6C6', 8],
  ['R6C7', 9],
  ['R6C9', 1],
  ['R7C3', 2],
  ['R7C5', 3],
  ['R7C7', 4],
  ['R8C2', 5],
  ['R8C4', 6],
  ['R8C6', 7],
  ['R8C8', 8],
  ['R9C6', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
