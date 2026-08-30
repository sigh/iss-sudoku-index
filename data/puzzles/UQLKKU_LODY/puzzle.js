// Title: How Many X-Wings? A Sudoku Trainer!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=UQLKKU_LODY
// Source: https://cracking-the-cryptic.web.app/sudoku/3BP8g6T8tL

// Normal Sudoku rules apply: digits 1-9 once each in every row, column, and
// 3x3 box. The payload carries no other clue geometry (no lines, cages, or
// overlays) and no rules text, so the standard Shape('9x9') regions are the
// full ruleset.

const givens = [
  new Given('R1C3', 1),
  new Given('R1C4', 2),
  new Given('R1C9', 8),
  new Given('R2C3', 3),
  new Given('R2C4', 4),
  new Given('R2C9', 2),
  new Given('R3C1', 5),
  new Given('R3C6', 3),
  new Given('R3C7', 1),
  new Given('R4C1', 6),
  new Given('R4C6', 1),
  new Given('R4C7', 8),
  new Given('R6C3', 9),
  new Given('R6C4', 3),
  new Given('R6C9', 5),
  new Given('R7C3', 4),
  new Given('R7C4', 8),
  new Given('R7C9', 3),
  new Given('R8C1', 1),
  new Given('R8C6', 6),
  new Given('R8C7', 7),
  new Given('R9C1', 8),
  new Given('R9C6', 4),
  new Given('R9C7', 5),
];

return [
  new Shape('9x9'),
  ...givens,
];
