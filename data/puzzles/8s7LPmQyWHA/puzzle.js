// Title: The Hardest Sudoku... And How To Solve It
// Author: Unknown
// Video: https://www.youtube.com/watch?v=8s7LPmQyWHA
// Source: https://cracking-the-cryptic.web.app/sudoku/3Btgb7QLLp

// The published puzzle data carries no rules text, so the encoding below is
// what the drawn board states on its own:
//
//   - Normal sudoku rules: each row, column and 3x3 box holds 1-9 once each.
//   - 14 givens.
//
// The payload also draws 8 cells of uniform grey underlay shading (two
// 4-cell diagonal runs flanking the grid's centre) with no per-cell
// distinguishing marks and no rules text naming them, so they are decoration
// and are not encoded. Nothing else is drawn: no lines, arrows, cages or
// outside clues. Any further rule the setter stated with the puzzle is not
// present in the published data and is therefore not encoded; 14 givens are
// provably too few to pin a classic 9x9 grid uniquely (17 is the proven
// minimum), so this encoding is far from unique.

const givens = [
  new Given('R1C6', 1),
  new Given('R1C7', 2),
  new Given('R2C7', 3),
  new Given('R2C8', 4),
  new Given('R3C8', 5),
  new Given('R3C9', 6),
  new Given('R4C9', 7),
  new Given('R6C1', 1),
  new Given('R7C1', 7),
  new Given('R7C2', 2),
  new Given('R8C2', 4),
  new Given('R8C3', 8),
  new Given('R9C3', 6),
  new Given('R9C4', 3),
];

return [
  new Shape('9x9'),
  ...givens,
];
