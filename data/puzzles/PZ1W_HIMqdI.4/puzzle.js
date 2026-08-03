// Title: Relentless
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=PZ1W_HIMqdI
// Source: https://tinyurl.com/mv67z8kz

// Normal sudoku rules apply. No other clues are present in the payload:
// standard row/column/box all-different constraints (ISS default) plus
// the givens below.

return [
  new Shape('9x9'),

  // Givens, transcribed from the source grid (row-major).
  new Given('R1C8', 8),
  new Given('R2C3', 1), new Given('R2C4', 2), new Given('R2C9', 5),
  new Given('R3C2', 3), new Given('R3C3', 4), new Given('R3C4', 5), new Given('R3C5', 6),
  new Given('R4C2', 7), new Given('R4C3', 8), new Given('R4C4', 9), new Given('R4C5', 1),
  new Given('R5C3', 2), new Given('R5C4', 3), new Given('R5C6', 5), new Given('R5C7', 6),
  new Given('R6C5', 7), new Given('R6C6', 8), new Given('R6C7', 9), new Given('R6C8', 1),
  new Given('R7C5', 2), new Given('R7C6', 3), new Given('R7C7', 4), new Given('R7C8', 5),
  new Given('R8C1', 4), new Given('R8C6', 6), new Given('R8C7', 7),
  new Given('R9C2', 9),
];
