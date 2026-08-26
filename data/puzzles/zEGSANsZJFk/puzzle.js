// Title: A Clever Classic Strategy
// Author: 
// Video: https://www.youtube.com/watch?v=zEGSANsZJFk
// Source: https://cracking-the-cryptic.web.app/sudoku/4NR789bfTN

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 5],
  ['R1C7', 3],
  ['R1C8', 1],
  ['R1C9', 4],
  ['R3C2', 8],
  ['R3C3', 7],
  ['R3C4', 3],
  ['R4C3', 2],
  ['R4C5', 4],
  ['R4C9', 1],
  ['R5C8', 8],
  ['R6C1', 9],
  ['R6C3', 8],
  ['R6C4', 7],
  ['R6C7', 2],
  ['R7C6', 1],
  ['R7C8', 3],
  ['R8C2', 4],
  ['R8C5', 5],
  ['R8C7', 7],
  ['R8C9', 2],
  ['R9C2', 6],
  ['R9C6', 2],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
