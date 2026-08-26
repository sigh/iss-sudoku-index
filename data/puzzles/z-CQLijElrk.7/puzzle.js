// Title: September 4, 2021: Classic
// Author: clover!
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/zu6zwajs

// Normal sudoku rules. 1-9 once each in every row, column and 3x3 box.

const givens = [
  ['R1C1', 1],
  ['R1C3', 2],
  ['R1C5', 3],
  ['R1C7', 4],
  ['R1C9', 5],
  ['R2C4', 6],
  ['R3C1', 7],
  ['R3C6', 8],
  ['R3C9', 6],
  ['R4C3', 9],
  ['R4C8', 2],
  ['R5C1', 6],
  ['R5C9', 7],
  ['R6C2', 7],
  ['R6C7', 3],
  ['R7C1', 5],
  ['R7C4', 7],
  ['R7C9', 8],
  ['R8C6', 9],
  ['R9C1', 4],
  ['R9C3', 3],
  ['R9C5', 2],
  ['R9C7', 1],
  ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
