// Title: Oct. 3, 2022: [SECRET]deg Angles
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xL75pjM7j9c
// Source: https://tinyurl.com/3scsaxr2

// Standard 9x9 sudoku (default row/column/box all-different). Digits cannot
// repeat along the two marked diagonals; both `diagonal+` and `diagonal-`
// are set in the payload, so both the '/' and '\' diagonals are drawn.

// Givens, transcribed from the payload grid.
const givens = [
  ['R1C2', 4], ['R1C5', 8], ['R1C8', 7],
  ['R2C1', 1], ['R2C3', 3], ['R2C7', 6], ['R2C9', 4],
  ['R3C2', 2], ['R3C4', 4], ['R3C8', 5],
  ['R4C7', 1],
  ['R5C1', 9], ['R5C9', 2],
  ['R6C3', 7],
  ['R7C2', 3], ['R7C6', 5], ['R7C8', 4],
  ['R8C1', 4], ['R8C3', 6], ['R8C7', 5], ['R8C9', 3],
  ['R9C2', 5], ['R9C5', 3], ['R9C8', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  // '/'-oriented diagonal R1C9-R2C8-...-R9C1.
  new Diagonal(1),
  // '\'-oriented diagonal R1C1-R2C2-...-R9C9.
  new Diagonal(-1),
];
