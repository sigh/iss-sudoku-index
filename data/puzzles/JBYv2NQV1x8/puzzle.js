// Title: The Loneliest Number
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=JBYv2NQV1x8
// Source: https://tinyurl.com/TheLoneliestNumber

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C3', 2],
  ['R1C4', 3],
  ['R1C6', 6],
  ['R1C7', 7],
  ['R2C4', 4],
  ['R2C6', 5],
  ['R3C1', 3],
  ['R3C9', 8],
  ['R4C1', 2],
  ['R4C2', 1],
  ['R4C8', 9],
  ['R4C9', 7],
  ['R5C5', 1],
  ['R6C1', 4],
  ['R6C2', 5],
  ['R6C8', 1],
  ['R6C9', 3],
  ['R7C1', 8],
  ['R7C9', 4],
  ['R8C4', 6],
  ['R8C6', 2],
  ['R9C3', 7],
  ['R9C4', 9],
  ['R9C6', 8],
  ['R9C7', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
