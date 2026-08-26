// Title: February 19, 2022: Pufferfish
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=HaK08DW5pJE
// Source: https://tinyurl.com/35wu87xv

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C3', 6],
  ['R2C4', 7],
  ['R2C5', 1],
  ['R2C6', 2],
  ['R2C7', 3],
  ['R3C2', 8],
  ['R3C6', 4],
  ['R3C8', 5],
  ['R4C5', 5],
  ['R4C6', 1],
  ['R4C7', 4],
  ['R4C8', 2],
  ['R5C1', 8],
  ['R5C5', 2],
  ['R5C6', 3],
  ['R5C8', 1],
  ['R6C8', 9],
  ['R7C1', 9],
  ['R7C3', 1],
  ['R7C8', 8],
  ['R8C2', 4],
  ['R8C7', 6],
  ['R9C3', 7],
  ['R9C5', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
