// Title: New Sudoku Trick: The 'Mirrored' Y-Wing
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1_IMRVojNL8
// Source: https://cracking-the-cryptic.web.app/sudoku/RGbb2TQ4Bd

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 5],
  ['R1C6', 6],
  ['R1C8', 8],
  ['R2C1', 8],
  ['R2C4', 7],
  ['R2C9', 4],
  ['R3C1', 2],
  ['R3C7', 7],
  ['R4C2', 3],
  ['R4C5', 7],
  ['R5C6', 4],
  ['R5C7', 3],
  ['R6C8', 1],
  ['R7C3', 9],
  ['R7C4', 4],
  ['R7C9', 7],
  ['R8C3', 6],
  ['R8C4', 1],
  ['R8C6', 3],
  ['R8C7', 2],
  ['R8C8', 9],
  ['R9C1', 5],
  ['R9C3', 2],
  ['R9C9', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
