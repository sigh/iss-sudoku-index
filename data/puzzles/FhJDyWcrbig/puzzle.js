// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FhJDyWcrbig
// Source: https://app.crackingthecryptic.com/phgP8JFjqF

// Normal sudoku rules apply: standard 9x9 grid, rows/columns/3x3 boxes each
// contain 1-9 once. The payload's regions match the default box partition, so
// no NoBoxes/RegionSize override is needed. Givens transcribed from the
// payload's cells array.

return [
  new Shape('9x9'),
  new Given('R1C5', 3), new Given('R1C8', 8),
  new Given('R2C2', 4), new Given('R2C3', 9), new Given('R2C4', 7),
  new Given('R3C1', 3), new Given('R3C2', 5), new Given('R3C4', 1), new Given('R3C9', 9),
  new Given('R4C8', 2), new Given('R4C9', 6),
  new Given('R5C7', 7), new Given('R5C8', 9),
  new Given('R6C4', 5), new Given('R6C5', 2), new Given('R6C9', 8),
  new Given('R7C2', 1), new Given('R7C9', 4),
  new Given('R8C3', 5), new Given('R8C4', 2),
  new Given('R9C2', 6), new Given('R9C3', 8), new Given('R9C6', 4), new Given('R9C8', 3),
];
