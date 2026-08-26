// Title: Easy enough ... if you can spot the trick
// Author: 
// Video: https://www.youtube.com/watch?v=G_7VXwdc0ow
// Source: https://cracking-the-cryptic.web.app/sudoku/RLDD8HfnTN

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C2', 3],
  ['R1C5', 1],
  ['R1C9', 6],
  ['R2C2', 1],
  ['R2C3', 8],
  ['R2C6', 6],
  ['R2C9', 9],
  ['R3C3', 4],
  ['R3C4', 3],
  ['R4C9', 2],
  ['R5C2', 4],
  ['R5C4', 5],
  ['R5C8', 1],
  ['R6C1', 5],
  ['R6C4', 9],
  ['R6C7', 7],
  ['R7C5', 6],
  ['R7C8', 4],
  ['R8C3', 3],
  ['R8C4', 2],
  ['R8C9', 8],
  ['R9C2', 8],
  ['R9C3', 2],
  ['R9C5', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
