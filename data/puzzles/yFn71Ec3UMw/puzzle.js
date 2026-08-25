// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=yFn71Ec3UMw
// Source: https://app.crackingthecryptic.com/Ngj8FtpPM6

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 23
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 5),
  new Given('R1C7', 1),
  new Given('R1C8', 6),
  new Given('R1C9', 2),
  new Given('R2C1', 5),
  new Given('R2C2', 8),
  new Given('R3C1', 9),
  new Given('R3C6', 4),
  new Given('R4C5', 2),
  new Given('R4C6', 7),
  new Given('R4C7', 9),
  new Given('R5C2', 9),
  new Given('R5C8', 5),
  new Given('R5C9', 4),
  new Given('R6C1', 2),
  new Given('R6C8', 8),
  new Given('R7C1', 6),
  new Given('R7C4', 8),
  new Given('R8C4', 3),
  new Given('R8C7', 7),
  new Given('R9C3', 4),
  new Given('R9C4', 2),
  new Given('R9C5', 5),
];
