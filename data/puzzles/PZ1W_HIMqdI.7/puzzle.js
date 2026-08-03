// Title: 6/7/23: G
// Author: Unknown
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://tinyurl.com/5x7765su

// Rules encoded:
// - Normal sudoku rules (9x9, rows/columns/3x3 boxes all-different -- ISS
//   default). The payload carries no other clue geometry (no cages, lines,
//   arrows or overlays) and no rules text beyond "Normal sudoku rules apply.".

// Givens transcribed from the payload's grid values (rows 1, 9 and columns
// 1, 9 carry none).
const GIVENS = [
  ['R2C2', 3], ['R2C3', 4], ['R2C4', 5], ['R2C5', 6], ['R2C6', 7],
  ['R2C7', 8], ['R2C8', 9],
  ['R3C2', 1], ['R3C3', 8],
  ['R4C2', 9], ['R4C4', 4], ['R4C5', 5], ['R4C6', 8], ['R4C7', 1],
  ['R4C8', 3],
  ['R5C2', 8], ['R5C4', 2], ['R5C8', 6],
  ['R6C2', 7], ['R6C4', 6], ['R6C5', 3], ['R6C6', 1], ['R6C8', 2],
  ['R7C2', 6], ['R7C8', 1],
  ['R8C2', 2], ['R8C3', 9], ['R8C4', 8], ['R8C5', 1], ['R8C6', 3],
  ['R8C7', 4], ['R8C8', 7],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
