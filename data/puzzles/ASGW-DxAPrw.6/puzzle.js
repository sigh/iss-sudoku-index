// Title: Borealis Dancing
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ASGW-DxAPrw
// Source: https://tinyurl.com/3j96v549

// Standard Sudoku rules apply. The given table is transcribed from the puzzle.
const givens = [
  ['R1C2', 4], ['R1C5', 7], ['R1C6', 8], ['R1C8', 3],
  ['R2C4', 5], ['R2C5', 6], ['R3C3', 3], ['R3C4', 4], ['R3C9', 1],
  ['R4C2', 1], ['R4C3', 2], ['R4C9', 4], ['R6C1', 6], ['R6C7', 8],
  ['R6C8', 9], ['R7C1', 9], ['R7C6', 6], ['R7C7', 7], ['R8C5', 4],
  ['R8C6', 5], ['R9C2', 7], ['R9C4', 2], ['R9C5', 3], ['R9C8', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
