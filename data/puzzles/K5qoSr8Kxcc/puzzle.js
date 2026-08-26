// Title: Expert Sudoku Skills: Hidden Pairs
// Author: 
// Video: https://www.youtube.com/watch?v=K5qoSr8Kxcc
// Source: https://cracking-the-cryptic.web.app/sudoku/JGR8mqggLJ

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C5', 2],
  ['R1C9', 3],
  ['R2C2', 2],
  ['R2C4', 4],
  ['R2C8', 5],
  ['R3C3', 5],
  ['R3C7', 6],
  ['R4C8', 7],
  ['R5C1', 3],
  ['R5C5', 6],
  ['R5C9', 1],
  ['R6C2', 8],
  ['R7C3', 8],
  ['R7C7', 2],
  ['R8C2', 7],
  ['R8C6', 1],
  ['R8C8', 4],
  ['R9C1', 6],
  ['R9C5', 3],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
