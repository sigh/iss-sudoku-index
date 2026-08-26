// Title: "Just" a Classic sudoku?
// Author: 
// Video: https://www.youtube.com/watch?v=jxRqJjioRtg
// Source: https://cracking-the-cryptic.web.app/sudoku/4L3rGTqPMg

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C7', 8],
  ['R2C2', 7],
  ['R2C6', 4],
  ['R2C8', 1],
  ['R3C2', 5],
  ['R3C4', 9],
  ['R3C5', 8],
  ['R3C8', 2],
  ['R3C9', 6],
  ['R4C2', 8],
  ['R4C6', 3],
  ['R5C3', 1],
  ['R5C7', 4],
  ['R6C4', 7],
  ['R6C8', 9],
  ['R7C1', 8],
  ['R7C2', 2],
  ['R7C5', 1],
  ['R7C6', 9],
  ['R7C8', 4],
  ['R8C2', 6],
  ['R8C4', 2],
  ['R8C8', 8],
  ['R9C3', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
