// Title: Do Sudoku Dream of Jellyfish?
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ZHYM_e5sXaI
// Source: https://tinyurl.com/4k7cpdnh

// Plain 9x9 classic sudoku. The source payload's ruleset text names only the
// standard row/column/box rules (stated twice) and carries no other clue
// geometry (no cages, lines, arrows, or overlays), so nothing beyond the
// default Sudoku constraints and the givens below is encoded.

// Givens, transcribed from the source's grid (row-major).
return [
  new Shape('9x9'),
  new Given('R1C1', 2), new Given('R1C5', 1), new Given('R1C9', 4),
  new Given('R2C4', 9), new Given('R2C6', 2),
  new Given('R3C3', 8), new Given('R3C5', 7), new Given('R3C7', 3),
  new Given('R4C2', 7), new Given('R4C4', 8), new Given('R4C6', 6), new Given('R4C8', 4),
  new Given('R5C1', 6), new Given('R5C3', 9), new Given('R5C7', 8), new Given('R5C9', 5),
  new Given('R6C2', 5), new Given('R6C4', 7), new Given('R6C6', 9), new Given('R6C8', 6),
  new Given('R7C3', 4), new Given('R7C5', 6), new Given('R7C7', 7),
  new Given('R8C4', 3), new Given('R8C6', 8),
  new Given('R9C1', 3), new Given('R9C5', 2), new Given('R9C9', 1),
];
