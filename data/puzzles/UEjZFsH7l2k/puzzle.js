// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=UEjZFsH7l2k
// Source: https://sudokupad.app/F2GHtpdPDm
//
// Normal sudoku rules apply: standard row, column, and 3x3 box all-different
// constraints (the payload's `regions` array lists exactly the nine standard
// boxes, so no NoBoxes/RegionSize override is needed). No other clues are
// drawn in the payload.

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's per-cell values.
  new Given('R1C2', 8),
  new Given('R1C6', 5),
  new Given('R1C8', 6),
  new Given('R2C7', 2),
  new Given('R3C1', 1),
  new Given('R3C2', 6),
  new Given('R3C9', 4),
  new Given('R4C1', 4),
  new Given('R4C7', 3),
  new Given('R4C8', 5),
  new Given('R5C1', 5),
  new Given('R5C4', 2),
  new Given('R5C6', 8),
  new Given('R5C9', 7),
  new Given('R6C2', 7),
  new Given('R6C3', 3),
  new Given('R6C9', 1),
  new Given('R7C1', 3),
  new Given('R7C8', 9),
  new Given('R7C9', 5),
  new Given('R8C3', 9),
  new Given('R8C4', 3),
  new Given('R9C2', 5),
  new Given('R9C4', 9),
  new Given('R9C6', 7),
  new Given('R9C8', 3),
];
