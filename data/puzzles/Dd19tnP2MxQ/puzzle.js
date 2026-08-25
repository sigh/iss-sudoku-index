// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Dd19tnP2MxQ
// Source: https://sudokupad.app/rqRjtMrL74

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 20
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C6', 4),
  new Given('R1C7', 3),
  new Given('R2C3', 6),
  new Given('R2C4', 9),
  new Given('R2C5', 5),
  new Given('R4C3', 2),
  new Given('R4C4', 6),
  new Given('R4C8', 8),
  new Given('R5C2', 5),
  new Given('R5C8', 2),
  new Given('R6C2', 4),
  new Given('R6C6', 7),
  new Given('R6C7', 5),
  new Given('R8C5', 9),
  new Given('R8C6', 3),
  new Given('R8C7', 7),
  new Given('R9C3', 8),
  new Given('R9C4', 2),
  new Given('R9C8', 6),
];
