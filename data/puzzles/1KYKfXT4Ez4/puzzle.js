// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1KYKfXT4Ez4
// Source: https://cracking-the-cryptic.web.app/sudoku/6pRhD33FMg

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No rules text is present and no lines,
// cages, arrows, or overlays appear in the payload; the puzzle is fully
// determined by its 22 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R1C6', 9),
  new Given('R1C7', 1),
  new Given('R3C3', 2),
  new Given('R3C7', 7),
  new Given('R4C2', 1),
  new Given('R4C4', 5),
  new Given('R5C1', 3),
  new Given('R5C3', 8),
  new Given('R5C4', 1),
  new Given('R6C1', 5),
  new Given('R6C5', 4),
  new Given('R6C6', 2),
  new Given('R6C8', 3),
  new Given('R7C2', 8),
  new Given('R7C5', 1),
  new Given('R7C7', 6),
  new Given('R7C8', 9),
  new Given('R8C2', 6),
  new Given('R9C4', 4),
  new Given('R9C8', 5),
  new Given('R9C9', 3),
];
