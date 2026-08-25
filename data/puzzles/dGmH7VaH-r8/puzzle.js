// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=dGmH7VaH-r8
// Source: https://app.crackingthecryptic.com/4qg68DmGmb

// Normal sudoku rules apply: standard 9x9 grid, rows, columns and the nine
// 3x3 boxes each contain 1-9 once. No cages, lines, arrows or other variant
// geometry are present in the source. The payload's `regions` array lists
// the ordinary nine boxes (in a non-row-major order), so no explicit Region
// constraint is needed beyond the default Shape('9x9') box partition.

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C2', 8),
  new Given('R2C1', 4),
  new Given('R2C3', 3),
  new Given('R2C6', 5),
  new Given('R2C7', 6),
  new Given('R3C1', 9),
  new Given('R3C2', 7),
  new Given('R3C4', 6),
  new Given('R3C6', 3),
  new Given('R3C8', 5),
  new Given('R4C7', 3),
  new Given('R5C2', 1),
  new Given('R5C4', 3),
  new Given('R5C6', 9),
  new Given('R5C7', 7),
  new Given('R5C9', 6),
  new Given('R6C2', 3),
  new Given('R6C3', 4),
  new Given('R6C5', 5),
  new Given('R6C8', 9),
  new Given('R7C4', 7),
  new Given('R7C7', 5),
  new Given('R7C9', 8),
  new Given('R8C2', 4),
  new Given('R8C3', 7),
  new Given('R8C7', 1),
  new Given('R8C9', 2),
];
