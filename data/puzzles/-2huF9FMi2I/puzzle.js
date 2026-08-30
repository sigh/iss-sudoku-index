// Title: TvZ StarCraft Sudoku
// Author: Matt Iverson
// Video: https://www.youtube.com/watch?v=-2huF9FMi2I
// Source: https://cracking-the-cryptic.web.app/sudoku/M3DN73JQf4

// Normal Sudoku rules apply (rows, columns and boxes; the payload's
// `regions` are the ordinary nine 3x3 boxes). The raw payload carries no
// rules text at all, so only the givens are encoded here. The payload also
// colours 28 cells (13 orange givens, 11 purple givens, plus 4 further
// purple cells with no given digit) and marks two diagonals flanking the
// grid's corner-to-corner anti-diagonal with green/red 1x1 markers just
// outside the top-right and bottom-left corners; no drawn text or numeral
// gives either colour scheme a rule, so neither is encoded.
const givens = [
  new Given('R1C1', 6), new Given('R1C3', 9), new Given('R1C6', 7), new Given('R1C9', 8),
  new Given('R2C2', 8), new Given('R2C5', 6), new Given('R2C8', 9),
  new Given('R3C1', 7), new Given('R3C4', 4), new Given('R3C7', 5),
  new Given('R4C3', 7), new Given('R4C6', 8), new Given('R4C9', 5),
  new Given('R5C2', 6), new Given('R5C5', 4),
  new Given('R6C4', 6), new Given('R6C7', 4),
  new Given('R7C3', 4), new Given('R7C9', 6),
  new Given('R8C5', 5), new Given('R8C8', 7),
  new Given('R9C1', 9), new Given('R9C4', 7), new Given('R9C7', 8),
];

return [
  new Shape('9x9'),
  ...givens,
];
