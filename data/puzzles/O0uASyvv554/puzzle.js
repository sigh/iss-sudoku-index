// Title: Classic Sudoku:  Bonus Puzzle 4:  [This is STUNNING]
// Author: 
// Video: https://www.youtube.com/watch?v=O0uASyvv554
// Source: https://cracking-the-cryptic.web.app/sudoku/8M9rgRNpL2

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 6],
  ['R1C4', 7],
  ['R1C6', 8],
  ['R1C9', 4],
  ['R3C3', 2],
  ['R3C5', 1],
  ['R3C7', 3],
  ['R4C1', 7],
  ['R4C9', 6],
  ['R5C3', 3],
  ['R5C5', 9],
  ['R5C7', 2],
  ['R6C1', 8],
  ['R6C9', 7],
  ['R7C3', 8],
  ['R7C5', 5],
  ['R7C7', 1],
  ['R9C1', 4],
  ['R9C4', 1],
  ['R9C6', 9],
  ['R9C9', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
