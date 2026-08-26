// Title: How To Sharpen Your Sudoku Skills
// Author: 
// Video: https://www.youtube.com/watch?v=Ygb3bIFAJzY
// Source: https://cracking-the-cryptic.web.app/sudoku/2t6fgFRHfj

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C2', 7],
  ['R2C4', 5],
  ['R2C6', 9],
  ['R2C8', 4],
  ['R3C3', 5],
  ['R3C5', 1],
  ['R3C7', 2],
  ['R4C2', 9],
  ['R4C8', 5],
  ['R5C1', 7],
  ['R5C5', 3],
  ['R5C9', 4],
  ['R6C2', 6],
  ['R6C8', 3],
  ['R7C3', 1],
  ['R7C5', 2],
  ['R7C7', 3],
  ['R8C2', 8],
  ['R8C4', 6],
  ['R8C6', 4],
  ['R8C8', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
