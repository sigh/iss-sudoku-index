// Title: 3.14: 22/7 GAS Edition
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=-pInDSLVfCo
// Source: https://tinyurl.com/ync59rbs

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R2C1', 3],
  ['R2C5', 1],
  ['R2C9', 4],
  ['R3C2', 1],
  ['R3C4', 5],
  ['R3C6', 9],
  ['R4C5', 2],
  ['R4C8', 6],
  ['R4C9', 5],
  ['R5C2', 3],
  ['R5C3', 5],
  ['R5C7', 8],
  ['R5C8', 9],
  ['R6C1', 7],
  ['R6C2', 9],
  ['R6C5', 3],
  ['R7C4', 2],
  ['R7C6', 3],
  ['R7C8', 8],
  ['R8C1', 4],
  ['R8C5', 6],
  ['R8C9', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
