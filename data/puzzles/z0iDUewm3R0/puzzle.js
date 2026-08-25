// Title: Diagonal Sudoku
// Author: Jan Mrozowski
// Video: https://www.youtube.com/watch?v=z0iDUewm3R0
// Source: https://app.crackingthecryptic.com/L9jqGq4Qtq

// Standard Sudoku rules apply, plus both main diagonals are all-different.
const givens = [
  ['R2C1',1], ['R2C2',2], ['R2C3',4], ['R2C4',6], ['R2C6',3],
  ['R3C1',5], ['R3C4',2], ['R3C6',1],
  ['R4C1',9], ['R4C4',3], ['R4C6',2],
  ['R5C1',4], ['R5C2',8], ['R5C3',1], ['R5C4',7], ['R5C6',9],
  ['R6C1',3], ['R6C6',4],
  ['R7C1',2], ['R7C6',5],
  ['R8C1',6], ['R8C6',8], ['R8C7',9], ['R8C8',7], ['R8C9',2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),
  new Diagonal(1),
  new Diagonal(-1),
];
