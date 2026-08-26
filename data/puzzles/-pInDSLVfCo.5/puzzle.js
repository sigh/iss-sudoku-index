// Title: Mar. 18, 2022: GAS o'clock
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=-pInDSLVfCo
// Source: https://tinyurl.com/2nh5etdk

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C4', 1],
  ['R1C6', 2],
  ['R2C2', 7],
  ['R2C5', 6],
  ['R2C8', 3],
  ['R3C3', 5],
  ['R3C5', 7],
  ['R3C7', 2],
  ['R4C1', 8],
  ['R4C5', 9],
  ['R4C9', 4],
  ['R5C2', 4],
  ['R5C3', 6],
  ['R5C5', 5],
  ['R5C6', 8],
  ['R5C7', 3],
  ['R5C8', 1],
  ['R6C1', 9],
  ['R6C9', 5],
  ['R7C3', 3],
  ['R7C5', 4],
  ['R7C7', 1],
  ['R8C2', 9],
  ['R8C5', 2],
  ['R8C8', 6],
  ['R9C4', 8],
  ['R9C6', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
