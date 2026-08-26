// Title: October 6, 2021: Nein Nines
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/k4wfy4xv

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 1],
  ['R1C5', 2],
  ['R2C4', 3],
  ['R2C7', 1],
  ['R3C2', 4],
  ['R3C6', 5],
  ['R3C9', 3],
  ['R4C3', 6],
  ['R4C5', 1],
  ['R4C8', 5],
  ['R5C1', 3],
  ['R5C4', 5],
  ['R5C6', 7],
  ['R5C9', 4],
  ['R6C2', 7],
  ['R6C5', 8],
  ['R6C7', 6],
  ['R7C1', 4],
  ['R7C4', 8],
  ['R7C8', 3],
  ['R8C3', 2],
  ['R8C6', 6],
  ['R9C5', 4],
  ['R9C7', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
