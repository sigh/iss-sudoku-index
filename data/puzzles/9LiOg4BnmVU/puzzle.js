// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9LiOg4BnmVU
// Source: https://sudokupad.app/bJMt8qb947

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the source's drawn grid (22 cells), plus R3C9=2,
// which the drawn grid omits; multiple independent viewer comments on the
// source video report this puzzle is missing a 2 in the top-right box, and
// that digit and location agree with the payload's own embedded solution.

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  new Given('R1C2', 6),
  new Given('R1C4', 1),
  new Given('R1C8', 3),
  new Given('R2C1', 9),
  new Given('R2C5', 2),
  new Given('R2C7', 6),
  new Given('R3C2', 1),
  new Given('R3C9', 2), // restored given, not drawn in the source (see comment above)
  new Given('R4C3', 3),
  new Given('R4C4', 6),
  new Given('R4C7', 7),
  new Given('R4C9', 9),
  new Given('R5C5', 8),
  new Given('R5C9', 4),
  new Given('R6C2', 5),
  new Given('R7C5', 3),
  new Given('R8C5', 4),
  new Given('R9C2', 2),
  new Given('R9C3', 7),
  new Given('R9C5', 6),
  new Given('R9C8', 1),
  new Given('R9C9', 3),
];
