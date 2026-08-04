// Title: Home Maker
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=WlxWJ3pPtLY
// Source: https://tinyurl.com/29st98fz

// Classic Sudoku: place the digits 1-9 once each in every row, column, and
// box. No additional rules are stated in the source.

const givens = [
  ['R1C1', 1], ['R1C3', 2], ['R1C7', 5], ['R1C9', 3],
  ['R2C4', 9], ['R2C6', 8],
  ['R3C2', 3], ['R3C8', 4],
  ['R4C2', 9], ['R4C5', 8], ['R4C7', 7],
  ['R5C4', 5], ['R5C6', 9],
  ['R6C3', 3], ['R6C5', 4], ['R6C8', 1],
  ['R7C2', 7], ['R7C8', 5],
  ['R8C4', 2], ['R8C6', 1],
  ['R9C1', 8], ['R9C3', 9], ['R9C7', 6], ['R9C9', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
