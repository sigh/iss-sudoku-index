// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tG4_pEFnBQc
// Source: https://cracking-the-cryptic.web.app/sudoku/JnnTrFfjb7

// Normal sudoku rules apply, and that's it. Row/column/box all-different are
// the engine's automatic baseline, so this script is only the shape and the
// given digits.
return [
  new Shape('9x9'),
  new Given('R1C7', 1),
  new Given('R2C2', 6),
  new Given('R2C5', 4),
  new Given('R2C8', 5),
  new Given('R3C1', 9),
  new Given('R3C4', 7),
  new Given('R3C6', 2),
  new Given('R4C5', 9),
  new Given('R4C7', 7),
  new Given('R5C2', 8),
  new Given('R5C8', 3),
  new Given('R6C3', 5),
  new Given('R6C5', 8),
  new Given('R7C4', 4),
  new Given('R7C6', 1),
  new Given('R7C9', 2),
  new Given('R8C2', 5),
  new Given('R8C5', 6),
  new Given('R8C8', 8),
  new Given('R9C3', 7),
];
