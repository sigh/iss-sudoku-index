// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=FDUwb3DWfTw
// Source: https://app.crackingthecryptic.com/sudoku/P4FmNH7q88

// Normal sudoku rules apply: each row, column and 3x3 box holds 1-9 once each.
// Shape('9x9') supplies the rows, columns and boxes, which match the nine
// whole-3x3-block regions the source lists. The source carries no rules text
// and draws no cages, lines, arrows or overlays, so the givens below are the
// whole puzzle.

// Givens transcribed from the digits drawn in the source's grid.
return [
  new Shape('9x9'),

  new Given('R1C6', 3),
  new Given('R1C7', 9),
  new Given('R1C9', 1),
  new Given('R2C2', 4),
  new Given('R2C4', 2),
  new Given('R3C4', 6),
  new Given('R3C9', 7),
  new Given('R4C2', 1),
  new Given('R4C3', 2),
  new Given('R4C4', 7),
  new Given('R4C9', 8),
  new Given('R5C5', 6),
  new Given('R6C1', 3),
  new Given('R6C6', 9),
  new Given('R6C7', 4),
  new Given('R6C8', 5),
  new Given('R7C1', 9),
  new Given('R7C6', 1),
  new Given('R8C6', 2),
  new Given('R8C8', 6),
  new Given('R9C1', 5),
  new Given('R9C3', 7),
  new Given('R9C4', 8),
];
