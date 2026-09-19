// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YxdsnstzObM

// Rules (WSC 2018 instruction booklet, page 6, entry "1-13) Classic
// sudoku"): Fill in the grid with digits 1 to 9 so that every row, column
// and outlined box contains nine different digits. No online source exists
// for this puzzle; Shape('9x9') supplies the row/column/box groups for
// standard sudoku rules.

// Givens: the 23 digits shown in the archived booklet page image
// (external-video-frame-90s.jpg), the puzzle's own printed example grid.
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C4', 2),
  new Given('R2C7', 8),
  new Given('R2C8', 1),
  new Given('R3C3', 5),
  new Given('R3C4', 1),
  new Given('R3C6', 3),
  new Given('R3C9', 2),
  new Given('R4C2', 2),
  new Given('R4C4', 6),
  new Given('R4C9', 3),
  new Given('R5C4', 8),
  new Given('R5C7', 7),
  new Given('R5C8', 4),
  new Given('R6C4', 7),
  new Given('R6C9', 5),
  new Given('R7C4', 5),
  new Given('R7C6', 2),
  new Given('R7C9', 6),
  new Given('R8C4', 9),
  new Given('R8C7', 1),
  new Given('R8C8', 7),
  new Given('R9C1', 8),
];
