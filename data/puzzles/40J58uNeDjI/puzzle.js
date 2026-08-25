// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=40J58uNeDjI
// Source: https://sudokupad.app/8BpMT83QNg

// Normal sudoku rules apply: standard 9x9 grid, rows/columns/3x3 boxes each
// contain 1-9 once. The payload's regions are exactly the nine standard 3x3
// boxes, so no NoBoxes/RegionSize override is needed. No cages, lines,
// arrows, or other geometry are present in the payload.

// Givens transcribed from the payload's `cells` array (row-major).
return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C5', 1),
  new Given('R1C6', 7),
  new Given('R2C4', 2),
  new Given('R2C8', 5),
  new Given('R2C9', 8),
  new Given('R3C6', 8),
  new Given('R3C7', 4),
  new Given('R4C3', 7),
  new Given('R4C4', 1),
  new Given('R4C6', 9),
  new Given('R4C7', 3),
  new Given('R5C2', 6),
  new Given('R5C7', 1),
  new Given('R6C1', 2),
  new Given('R6C9', 9),
  new Given('R7C1', 4),
  new Given('R7C2', 1),
  new Given('R7C5', 7),
  new Given('R7C7', 5),
  new Given('R8C2', 3),
  new Given('R8C6', 4),
  new Given('R8C7', 6),
  new Given('R9C4', 5),
];
