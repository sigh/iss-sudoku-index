// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=WHaDMg9NRxw
// Source: https://sudokupad.app/bH2LPJbF77

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload -- its `cages` array holds only three
// metadata stubs (title, rules text, withheld solution), no real cage. The
// puzzle is fully determined by its 27 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R1C5', 3),
  new Given('R1C8', 6),
  new Given('R2C1', 3),
  new Given('R2C6', 5),
  new Given('R2C9', 1),
  new Given('R3C1', 9),
  new Given('R3C7', 7),
  new Given('R4C1', 2),
  new Given('R4C2', 5),
  new Given('R4C8', 8),
  new Given('R5C2', 9),
  new Given('R5C9', 6),
  new Given('R6C1', 4),
  new Given('R6C3', 6),
  new Given('R6C4', 5),
  new Given('R6C9', 2),
  new Given('R7C1', 6),
  new Given('R7C3', 9),
  new Given('R7C4', 3),
  new Given('R8C5', 7),
  new Given('R8C6', 1),
  new Given('R9C3', 3),
  new Given('R9C4', 9),
  new Given('R9C6', 6),
  new Given('R9C7', 8),
  new Given('R9C8', 4),
];
