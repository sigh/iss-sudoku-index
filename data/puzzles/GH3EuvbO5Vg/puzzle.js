// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=GH3EuvbO5Vg
// Source: https://sudokupad.app/3MGDd6Tg8q

// Normal sudoku rules apply, and that's it. Row/column/box all-different are
// the engine's automatic baseline, so this script is only the shape and the
// given digits.
return [
  new Shape('9x9'),
  new Given('R1C2', 7),
  new Given('R1C4', 4),
  new Given('R1C5', 1),
  new Given('R1C6', 8),
  new Given('R1C9', 2),
  new Given('R2C5', 2),
  new Given('R2C7', 6),
  new Given('R3C4', 3),
  new Given('R3C9', 8),
  new Given('R4C1', 3),
  new Given('R4C3', 9),
  new Given('R4C4', 2),
  new Given('R4C5', 5),
  new Given('R5C2', 1),
  new Given('R5C8', 9),
  new Given('R6C5', 4),
  new Given('R6C6', 9),
  new Given('R6C7', 1),
  new Given('R6C9', 3),
  new Given('R7C1', 2),
  new Given('R7C6', 4),
  new Given('R8C3', 4),
  new Given('R8C5', 8),
  new Given('R9C1', 9),
  new Given('R9C4', 1),
  new Given('R9C5', 6),
  new Given('R9C6', 2),
  new Given('R9C8', 7),
];
