// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=loXmZF16alc
// Source: https://cracking-the-cryptic.web.app/sudoku/hjm4Fr4JPf

// No rules text in the payload. Normal sudoku rules apply (1-9 in each row,
// column and 3x3 box). Standard 3x3 box regions -- Shape('9x9') supplies
// rows/columns/boxes, matching the 9 whole-box regions in the payload. No
// other clue types (lines, cages, arrows) appear in the payload; the puzzle
// is fully determined by its 26 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C2', 3),
  new Given('R1C8', 6),
  new Given('R2C1', 7),
  new Given('R2C2', 8),
  new Given('R2C8', 5),
  new Given('R2C9', 1),
  new Given('R3C4', 1),
  new Given('R3C6', 4),
  new Given('R4C3', 5),
  new Given('R4C4', 6),
  new Given('R4C6', 2),
  new Given('R4C7', 9),
  new Given('R5C1', 2),
  new Given('R5C9', 6),
  new Given('R6C3', 9),
  new Given('R6C4', 3),
  new Given('R6C6', 7),
  new Given('R6C7', 2),
  new Given('R7C4', 7),
  new Given('R7C6', 8),
  new Given('R8C1', 8),
  new Given('R8C2', 5),
  new Given('R8C8', 2),
  new Given('R8C9', 4),
  new Given('R9C2', 4),
  new Given('R9C8', 1),
];
