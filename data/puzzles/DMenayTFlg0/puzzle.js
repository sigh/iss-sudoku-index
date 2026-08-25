// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=DMenayTFlg0
// Source: https://sudokupad.app/PNRdJfg8Mr

// Normal sudoku rules apply, and that's it. Row/column/box all-different are
// the engine's automatic baseline, so this script is only the shape and the
// given digits.
return [
  new Shape('9x9'),
  new Given('R1C6', 1),
  new Given('R2C3', 4),
  new Given('R2C8', 8),
  new Given('R2C9', 7),
  new Given('R3C7', 1),
  new Given('R3C8', 2),
  new Given('R3C9', 9),
  new Given('R4C2', 6),
  new Given('R4C5', 4),
  new Given('R4C7', 9),
  new Given('R4C9', 5),
  new Given('R5C2', 7),
  new Given('R5C4', 9),
  new Given('R5C6', 8),
  new Given('R5C9', 2),
  new Given('R6C3', 9),
  new Given('R6C5', 3),
  new Given('R6C9', 8),
  new Given('R7C4', 8),
  new Given('R7C6', 7),
  new Given('R7C8', 4),
  new Given('R8C1', 2),
  new Given('R8C4', 3),
  new Given('R8C5', 1),
  new Given('R9C1', 7),
  new Given('R9C3', 3),
  new Given('R9C6', 4),
];
