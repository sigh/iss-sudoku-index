// Title: Step-By-Step Method For Hard Sudokus
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=DEfff5yTj-k
// Source: https://cracking-the-cryptic.web.app/sudoku/hPB7rrg63H

// Normal sudoku rules: 1-9 once each in every row, column and 3x3 box.
// The payload draws no other clues.

const givens = [
  ['R1C2', 3],
  ['R1C3', 4],
  ['R1C7', 6],
  ['R1C8', 7],
  ['R2C1', 2],
  ['R2C9', 8],
  ['R3C1', 1],
  ['R3C5', 4],
  ['R3C9', 9],
  ['R4C4', 8],
  ['R4C6', 3],
  ['R5C3', 7],
  ['R5C7', 5],
  ['R6C4', 2],
  ['R6C6', 6],
  ['R7C1', 3],
  ['R7C5', 1],
  ['R7C9', 5],
  ['R8C1', 7],
  ['R8C9', 6],
  ['R9C2', 6],
  ['R9C3', 9],
  ['R9C7', 1],
  ['R9C8', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
