// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=RluIUq8GQjw
// Source: https://cracking-the-cryptic.web.app/sudoku/GjDFT3gM2m

// No rules text in the payload. Normal sudoku rules apply (1-9 in each row,
// column and 3x3 box). Standard 3x3 box regions -- Shape('9x9') supplies
// rows/columns/boxes, matching the 9 whole-box regions in the payload. No
// other clue types (lines, cages, arrows) appear in the payload; the puzzle
// is fully determined by its 23 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R1C5', 4),
  new Given('R1C9', 3),
  new Given('R2C2', 6),
  new Given('R2C4', 7),
  new Given('R2C6', 9),
  new Given('R2C8', 4),
  new Given('R4C2', 3),
  new Given('R4C4', 6),
  new Given('R4C6', 7),
  new Given('R4C8', 2),
  new Given('R5C1', 8),
  new Given('R6C2', 1),
  new Given('R6C4', 9),
  new Given('R6C6', 2),
  new Given('R6C8', 7),
  new Given('R8C2', 2),
  new Given('R8C4', 3),
  new Given('R8C6', 6),
  new Given('R8C8', 9),
  new Given('R9C1', 1),
  new Given('R9C5', 2),
  new Given('R9C9', 4),
];
