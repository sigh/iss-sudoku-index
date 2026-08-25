// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V4gINbyV-wE
// Source: https://sudokupad.app/JjHmpgqn3N

// Normal sudoku rules apply: standard 9x9 grid with the default row, column,
// and 3x3 box all-different constraints (regions in the payload match the
// default box partition), plus the 22 printed givens below.

return [
  new Shape('9x9'),

  // Givens, transcribed from the printed grid.
  new Given('R1C1', 9),
  new Given('R1C6', 8),
  new Given('R1C7', 4),
  new Given('R2C1', 4),
  new Given('R2C3', 3),
  new Given('R2C8', 5),
  new Given('R3C5', 7),
  new Given('R3C6', 9),
  new Given('R3C7', 2),
  new Given('R4C2', 5),
  new Given('R4C8', 4),
  new Given('R5C4', 6),
  new Given('R5C9', 1),
  new Given('R7C1', 3),
  new Given('R7C3', 7),
  new Given('R7C8', 2),
  new Given('R8C1', 1),
  new Given('R8C6', 6),
  new Given('R9C3', 2),
  new Given('R9C5', 4),
  new Given('R9C6', 5),
  new Given('R9C8', 8),
];
