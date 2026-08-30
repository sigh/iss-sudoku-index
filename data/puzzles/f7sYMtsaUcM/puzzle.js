// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=f7sYMtsaUcM
// Source: https://cracking-the-cryptic.web.app/sudoku/pTpfq3dd68

// No rules text is stored in the payload. Normal sudoku rules apply (1-9 in
// each row, column and 3x3 box). Standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes, matching the 9 whole-box regions in the
// payload. No other clue types (lines, cages, arrows) appear in the payload;
// the puzzle is fully determined by its 23 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C4', 9),
  new Given('R1C8', 6),
  new Given('R2C1', 9),
  new Given('R2C6', 3),
  new Given('R2C9', 1),
  new Given('R3C5', 1),
  new Given('R3C7', 2),
  new Given('R4C5', 9),
  new Given('R4C9', 2),
  new Given('R5C2', 7),
  new Given('R5C6', 8),
  new Given('R5C7', 5),
  new Given('R6C4', 7),
  new Given('R6C8', 1),
  new Given('R7C6', 6),
  new Given('R7C8', 4),
  new Given('R8C3', 5),
  new Given('R8C4', 3),
  new Given('R8C7', 6),
  new Given('R9C1', 3),
  new Given('R9C5', 7),
  new Given('R9C9', 9),
];
