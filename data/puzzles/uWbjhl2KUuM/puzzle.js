// Title: Classic Sudoku
// Author: Derek Neal
// Video: https://www.youtube.com/watch?v=uWbjhl2KUuM
// Source: https://cracking-the-cryptic.web.app/sudoku/9mL8LpMtnM

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes;
// the payload's `regions` are the ordinary nine boxes). No metadata, cages,
// lines, arrows, or coloured overlays are present in the payload.
// Givens transcribed from the source's drawn grid.

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R1C9', 9),
  new Given('R2C2', 2),
  new Given('R2C5', 9),
  new Given('R2C9', 7),
  new Given('R3C3', 3),
  new Given('R3C4', 7),
  new Given('R3C5', 8),
  new Given('R4C3', 4),
  new Given('R4C5', 3),
  new Given('R5C2', 6),
  new Given('R5C3', 5),
  new Given('R5C4', 1),
  new Given('R5C6', 4),
  new Given('R6C5', 2),
  new Given('R6C6', 9),
  new Given('R6C7', 6),
  new Given('R7C6', 5),
  new Given('R7C7', 4),
  new Given('R7C8', 8),
  new Given('R8C7', 7),
  new Given('R8C9', 2),
  new Given('R9C1', 8),
  new Given('R9C2', 4),
  new Given('R9C8', 9),
  new Given('R9C9', 1),
];
