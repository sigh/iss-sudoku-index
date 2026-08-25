// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=MSekULcyUwM
// Source: https://app.crackingthecryptic.com/N9TP8T9TjP

// Normal sudoku rules apply, and that's it. Row/column/box all-different are
// the engine's automatic baseline, so this script is only the shape and the
// given digits.
return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  new Given('R1C5', 6),
  new Given('R1C9', 3),
  new Given('R2C3', 3),
  new Given('R2C4', 8),
  new Given('R2C6', 4),
  new Given('R3C4', 1),
  new Given('R3C8', 2),
  new Given('R4C2', 2),
  new Given('R4C3', 6),
  new Given('R4C7', 4),
  new Given('R5C1', 3),
  new Given('R5C5', 2),
  new Given('R5C9', 6),
  new Given('R6C3', 9),
  new Given('R6C7', 3),
  new Given('R6C8', 5),
  new Given('R7C2', 4),
  new Given('R7C6', 5),
  new Given('R8C4', 6),
  new Given('R8C6', 1),
  new Given('R8C7', 7),
  new Given('R9C1', 1),
  new Given('R9C5', 7),
  new Given('R9C9', 9),
];
