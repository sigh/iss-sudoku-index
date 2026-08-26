// Title: August 24, 2021: TT Krayt Dino
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=7sWnbrADeWo
// Source: https://tinyurl.com/c8j6cc69

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C3', 1],
  ['R2C4', 2],
  ['R2C9', 3],
  ['R3C2', 4],
  ['R3C5', 5],
  ['R3C8', 6],
  ['R4C2', 7],
  ['R4C5', 4],
  ['R4C8', 5],
  ['R5C3', 3],
  ['R5C4', 1],
  ['R5C9', 2],
  ['R6C6', 8],
  ['R6C7', 9],
  ['R7C6', 9],
  ['R7C7', 5],
  ['R8C3', 2],
  ['R8C4', 3],
  ['R8C9', 1],
  ['R9C1', 1],
  ['R9C2', 6],
  ['R9C5', 7],
  ['R9C8', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
