// Title: Classic Sudoku Bonus Puzzle
// Author: 
// Video: https://www.youtube.com/watch?v=gFGPisnJqV8
// Source: https://cracking-the-cryptic.web.app/sudoku/FJGdqBMDFg

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 7],
  ['R1C5', 9],
  ['R2C3', 3],
  ['R2C4', 2],
  ['R2C7', 5],
  ['R2C8', 4],
  ['R3C2', 8],
  ['R4C8', 8],
  ['R5C2', 3],
  ['R5C6', 9],
  ['R5C9', 2],
  ['R6C2', 4],
  ['R6C3', 5],
  ['R6C5', 2],
  ['R6C8', 1],
  ['R6C9', 6],
  ['R7C9', 3],
  ['R8C5', 7],
  ['R8C6', 4],
  ['R9C2', 6],
  ['R9C5', 8],
  ['R9C6', 5],
  ['R9C7', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
