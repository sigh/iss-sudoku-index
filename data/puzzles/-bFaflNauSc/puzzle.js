// Title: Instinct vs Technique? The XYZ wing
// Author: 
// Video: https://www.youtube.com/watch?v=-bFaflNauSc
// Source: https://cracking-the-cryptic.web.app/sudoku/Jh3Th2pqn8

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 6],
  ['R1C2', 2],
  ['R1C4', 1],
  ['R1C5', 9],
  ['R1C6', 7],
  ['R1C9', 4],
  ['R2C2', 4],
  ['R2C5', 8],
  ['R2C7', 9],
  ['R3C3', 9],
  ['R3C7', 1],
  ['R3C9', 3],
  ['R4C2', 6],
  ['R4C4', 2],
  ['R4C6', 1],
  ['R5C5', 5],
  ['R5C6', 8],
  ['R6C4', 9],
  ['R6C6', 6],
  ['R6C8', 1],
  ['R7C1', 2],
  ['R7C3', 6],
  ['R7C7', 7],
  ['R8C3', 5],
  ['R8C5', 7],
  ['R8C8', 4],
  ['R9C1', 7],
  ['R9C6', 3],
  ['R9C8', 9],
  ['R9C9', 8],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
