// Title: Have a Holly Jolly Classic
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=bYOwPT0KfTk
// Source: https://tinyurl.com/mryfdtnb

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C3', 6],
  ['R1C5', 4],
  ['R2C2', 2],
  ['R2C4', 7],
  ['R2C6', 5],
  ['R3C1', 7],
  ['R3C3', 3],
  ['R3C5', 8],
  ['R3C7', 6],
  ['R4C2', 8],
  ['R4C4', 4],
  ['R4C6', 9],
  ['R4C8', 7],
  ['R5C3', 9],
  ['R5C5', 5],
  ['R5C7', 1],
  ['R6C4', 1],
  ['R6C6', 6],
  ['R6C8', 2],
  ['R7C5', 2],
  ['R7C7', 7],
  ['R7C9', 3],
  ['R8C6', 3],
  ['R8C8', 8],
  ['R9C7', 4],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
