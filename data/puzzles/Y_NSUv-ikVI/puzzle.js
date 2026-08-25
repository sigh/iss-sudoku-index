// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Y_NSUv-ikVI
// Source: https://app.crackingthecryptic.com/8bTrRRj9jh

// Normal sudoku rules apply: standard 3x3 box regions (the default for
// Shape('9x9')), plus the givens below transcribed from the payload's
// `cells` array. No cages, lines, or other geometry are present.

return [
  new Shape('9x9'),
  new Given('R1C7', 7),
  new Given('R1C9', 5),
  new Given('R2C4', 9),
  new Given('R2C5', 3),
  new Given('R3C2', 1),
  new Given('R3C3', 4),
  new Given('R3C6', 5),
  new Given('R3C7', 2),
  new Given('R4C6', 1),
  new Given('R4C7', 3),
  new Given('R5C1', 1),
  new Given('R5C6', 7),
  new Given('R6C1', 6),
  new Given('R6C3', 8),
  new Given('R6C5', 4),
  new Given('R6C8', 9),
  new Given('R7C4', 2),
  new Given('R7C8', 6),
  new Given('R8C1', 8),
  new Given('R8C8', 5),
  new Given('R8C9', 4),
  new Given('R9C3', 3),
];
