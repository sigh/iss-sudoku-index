// Title: Dec. 8, 2021: US Duck Socials
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=tK6z5BAkQ_M
// Source: https://tinyurl.com/25r9t8zk

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 1],
  ['R1C3', 2],
  ['R1C4', 3],
  ['R1C5', 4],
  ['R2C2', 5],
  ['R2C6', 6],
  ['R2C8', 4],
  ['R2C9', 1],
  ['R3C1', 7],
  ['R3C9', 5],
  ['R4C5', 3],
  ['R5C2', 3],
  ['R5C3', 7],
  ['R5C4', 6],
  ['R5C5', 8],
  ['R5C6', 4],
  ['R5C7', 5],
  ['R5C8', 1],
  ['R6C5', 2],
  ['R7C1', 9],
  ['R7C9', 6],
  ['R8C1', 3],
  ['R8C2', 8],
  ['R8C4', 1],
  ['R8C8', 5],
  ['R9C5', 5],
  ['R9C6', 8],
  ['R9C7', 3],
  ['R9C8', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
