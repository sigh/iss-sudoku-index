// Title: Valtari
// Author: shye
// Video: https://www.youtube.com/watch?v=n2No8hU2OwI
// Source: https://app.crackingthecryptic.com/sudoku/P6phpMtQfN

// Classic Sudoku: standard row/column/box all-different, no rules text and
// no cages/lines/arrows in the payload. The payload's own 9-region partition
// matches the default 3x3 boxes exactly, so no explicit Regions constraint
// is needed beyond the default Shape('9x9') baseline.

return [
  new Shape('9x9'),

  new Given('R1C1', 4),
  new Given('R1C9', 2),
  new Given('R2C3', 5),
  new Given('R2C5', 8),
  new Given('R2C6', 2),
  new Given('R2C7', 9),
  new Given('R3C2', 2),
  new Given('R3C8', 3),
  new Given('R4C3', 8),
  new Given('R4C5', 1),
  new Given('R5C1', 5),
  new Given('R5C2', 6),
  new Given('R5C5', 9),
  new Given('R5C8', 7),
  new Given('R5C9', 8),
  new Given('R6C5', 6),
  new Given('R6C7', 5),
  new Given('R7C2', 1),
  new Given('R7C8', 6),
  new Given('R8C3', 6),
  new Given('R8C4', 1),
  new Given('R8C5', 5),
  new Given('R8C7', 7),
  new Given('R9C1', 3),
  new Given('R9C9', 4),
];
