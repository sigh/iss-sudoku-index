// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=PlsqfSwGrNE
// Source: https://cracking-the-cryptic.web.app/sudoku/QjD8Hp67tB

// No rules text is stored in the payload and the video description names no
// extra ruleset, so this is normal sudoku rules only (1-9 in each row,
// column and 3x3 box). Standard 3x3 box regions -- Shape('9x9') supplies
// rows/columns/boxes, matching the 9 whole-box regions in the payload. No
// other clue types (lines, cages, arrows, overlays) appear in the payload;
// the puzzle is fully determined by its 24 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C5', 6),
  new Given('R1C9', 3),
  new Given('R2C2', 2),
  new Given('R2C3', 3),
  new Given('R2C5', 5),
  new Given('R2C8', 8),
  new Given('R3C4', 4),
  new Given('R3C8', 9),
  new Given('R4C4', 8),
  new Given('R4C7', 6),
  new Given('R5C3', 4),
  new Given('R5C7', 8),
  new Given('R6C3', 5),
  new Given('R6C6', 7),
  new Given('R7C2', 7),
  new Given('R7C6', 4),
  new Given('R8C2', 9),
  new Given('R8C5', 1),
  new Given('R8C7', 3),
  new Given('R8C8', 7),
  new Given('R9C1', 5),
  new Given('R9C5', 8),
  new Given('R9C9', 1),
];
