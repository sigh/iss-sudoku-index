// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Hp9OeEskB10
// Source: https://sudokupad.app/prGPj6tpT8

// Normal sudoku rules apply: standard 9x9 grid, digits 1-9, each row, column,
// and 3x3 box all different. The puzzle draws no cages, lines, arrows, or
// other overlays -- the default Shape('9x9') already enforces row, column,
// and box all-different, so only the givens need to be added.
// Givens transcribed from the puzzle's cell values.

return [
  new Shape('9x9'),

  new Given('R1C2', 5),
  new Given('R1C3', 8),
  new Given('R1C5', 9),
  new Given('R1C7', 7),

  new Given('R2C1', 3),

  new Given('R3C2', 1),
  new Given('R3C5', 3),
  new Given('R3C8', 8),

  new Given('R4C2', 8),
  new Given('R4C3', 3),
  new Given('R4C4', 9),
  new Given('R4C8', 7),

  new Given('R5C1', 5),
  new Given('R5C9', 9),

  new Given('R6C2', 2),
  new Given('R6C6', 4),
  new Given('R6C7', 5),
  new Given('R6C8', 1),

  new Given('R7C2', 4),
  new Given('R7C5', 1),
  new Given('R7C6', 2),
  new Given('R7C8', 5),

  new Given('R8C9', 4),

  new Given('R9C5', 8),
  new Given('R9C8', 2),
];
