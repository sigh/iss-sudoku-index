// Title: XV (-) Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=RO5rLcSoeBg
// Source: https://tinyurl.com/bdkpmfaj

// Standard Sudoku with no orthogonally adjacent pair summing to 5 or 10.
// The given table is transcribed from the f-puzzles grid.
const givens = [
  ['R1C1', 6], ['R1C5', 2],
  ['R2C2', 2], ['R2C4', 1], ['R2C7', 8], ['R2C8', 7], ['R2C9', 4],
  ['R3C3', 7],
  ['R4C2', 9], ['R4C4', 4],
  ['R5C1', 8], ['R5C5', 1], ['R5C9', 9],
  ['R6C6', 7], ['R6C8', 4],
  ['R7C6', 9], ['R7C8', 8],
  ['R8C6', 2], ['R8C8', 5],
  ['R9C7', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new StrictXV(),
];
