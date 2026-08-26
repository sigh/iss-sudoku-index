// Title: September 6, 2021: -Seas 5
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=McjswDKMFbI
// Source: https://tinyurl.com/cr424vtt

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 3],
  ['R1C4', 1],
  ['R1C9', 4],
  ['R2C2', 1],
  ['R2C5', 5],
  ['R2C8', 9],
  ['R3C1', 2],
  ['R3C6', 6],
  ['R3C7', 5],
  ['R4C1', 3],
  ['R4C3', 5],
  ['R4C6', 8],
  ['R4C7', 9],
  ['R5C2', 7],
  ['R5C5', 9],
  ['R5C8', 3],
  ['R6C3', 2],
  ['R6C4', 3],
  ['R6C9', 8],
  ['R7C1', 4],
  ['R7C2', 6],
  ['R7C5', 2],
  ['R8C4', 6],
  ['R8C6', 4],
  ['R8C9', 3],
  ['R9C2', 3],
  ['R9C5', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
