// Title: Our Classic Techniques
// Author: 
// Video: https://www.youtube.com/watch?v=lfFNqOT0fSM
// Source: https://cracking-the-cryptic.web.app/sudoku/BgQTDDr7rH

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C5', 9],
  ['R2C2', 1],
  ['R2C3', 4],
  ['R2C6', 5],
  ['R2C9', 8],
  ['R3C7', 3],
  ['R3C9', 4],
  ['R4C2', 2],
  ['R4C4', 3],
  ['R4C7', 7],
  ['R4C8', 4],
  ['R5C3', 6],
  ['R6C2', 8],
  ['R6C3', 1],
  ['R6C5', 2],
  ['R6C6', 4],
  ['R7C2', 6],
  ['R7C4', 9],
  ['R8C6', 6],
  ['R8C7', 9],
  ['R8C9', 2],
  ['R9C1', 8],
  ['R9C3', 9],
  ['R9C6', 1],
  ['R9C9', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
