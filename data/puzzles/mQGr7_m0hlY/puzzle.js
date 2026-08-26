// Title: In which a so-called "Expert" finally learns to Check his work ...
// Author: 
// Video: https://www.youtube.com/watch?v=mQGr7_m0hlY
// Source: https://cracking-the-cryptic.web.app/sudoku/Mfh3L8RD96

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C3', 5],
  ['R2C7', 4],
  ['R2C9', 9],
  ['R3C1', 3],
  ['R3C4', 8],
  ['R3C8', 6],
  ['R4C2', 3],
  ['R4C6', 6],
  ['R5C2', 4],
  ['R5C3', 9],
  ['R5C7', 2],
  ['R5C9', 7],
  ['R6C3', 7],
  ['R6C6', 5],
  ['R6C8', 1],
  ['R7C1', 4],
  ['R7C3', 6],
  ['R7C5', 5],
  ['R8C2', 1],
  ['R8C5', 9],
  ['R8C7', 7],
  ['R9C3', 3],
  ['R9C6', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
