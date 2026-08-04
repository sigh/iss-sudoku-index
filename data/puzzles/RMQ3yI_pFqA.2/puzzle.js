// Title: Make Way
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=RMQ3yI_pFqA
// Source: https://tinyurl.com/56j9hjpj

// Normal Sudoku Rules Apply -- no other rules given. Default row/column/box
// all-different groups (from Shape) are the entire ruleset; only Givens are
// added below.

// Givens transcribed from the source payload's grid array (row-major).
const GIVENS = {
  'R1C2': 5, 'R1C7': 3,
  'R2C4': 2, 'R2C5': 6, 'R2C7': 7, 'R2C9': 5,
  'R3C1': 2, 'R3C2': 6, 'R3C6': 8,
  'R4C3': 9, 'R4C6': 6, 'R4C8': 3,
  'R5C2': 8, 'R5C8': 7,
  'R6C2': 1, 'R6C4': 9, 'R6C7': 6,
  'R7C4': 7, 'R7C8': 9, 'R7C9': 4,
  'R8C1': 5, 'R8C3': 8, 'R8C5': 9, 'R8C6': 4,
  'R9C3': 1, 'R9C8': 5,
};

return [
  new Shape('9x9'),
  ...Object.entries(GIVENS).map(([cell, value]) => new Given(cell, value)),
];
