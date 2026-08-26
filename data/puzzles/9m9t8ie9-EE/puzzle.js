// Title: One Of The Best Classic Sudokus Ever
// Author: 
// Video: https://www.youtube.com/watch?v=9m9t8ie9-EE
// Source: https://cracking-the-cryptic.web.app/sudoku/PrfmJPgdft

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 5],
  ['R1C4', 2],
  ['R1C8', 4],
  ['R2C4', 6],
  ['R2C6', 3],
  ['R3C2', 3],
  ['R3C6', 9],
  ['R3C9', 7],
  ['R4C3', 3],
  ['R4C6', 7],
  ['R5C3', 7],
  ['R5C6', 8],
  ['R6C1', 6],
  ['R6C8', 2],
  ['R7C2', 8],
  ['R7C9', 3],
  ['R8C4', 4],
  ['R8C7', 6],
  ['R9C4', 1],
  ['R9C7', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
