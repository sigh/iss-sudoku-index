// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=nvWAPESEi3U
// Source: https://sudokupad.app/JgjNrG326Q

// Normal sudoku rules apply: standard 9x9 grid, standard row/column/box
// all-different (the default Shape('9x9') regions), plus the 25 printed
// givens below. No cages, lines, arrows, or other overlays are present.

return [
  new Shape('9x9'),

  new Given('R1C3', 8),
  new Given('R1C9', 7),
  new Given('R2C1', 6),
  new Given('R2C3', 1),
  new Given('R2C4', 5),
  new Given('R2C6', 3),
  new Given('R3C2', 7),
  new Given('R4C3', 7),
  new Given('R4C6', 4),
  new Given('R4C8', 6),
  new Given('R5C2', 8),
  new Given('R5C6', 1),
  new Given('R5C8', 9),
  new Given('R6C2', 2),
  new Given('R6C4', 8),
  new Given('R6C7', 7),
  new Given('R6C8', 3),
  new Given('R7C8', 8),
  new Given('R8C4', 1),
  new Given('R8C6', 5),
  new Given('R8C7', 3),
  new Given('R8C9', 4),
  new Given('R9C1', 9),
  new Given('R9C3', 3),
  new Given('R9C7', 1),
];
