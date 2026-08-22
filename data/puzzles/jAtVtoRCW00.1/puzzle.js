// Title: World's Smallest Puzzle Hunt 1
// Author: Clover
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://app.crackingthecryptic.com/sudoku/GJbrQ3j6Bp

// This is grid 1 of a three-grid puzzle hunt; only the clause that applies to
// this grid is encoded: "1-6 must appear in each row, column and marked
// region." The drawn regions are the standard 2x3 box partition of a 6-wide
// grid, so the default Shape('6x6') boxes already match them.
// The other printed clauses (thermometers in grid 2, cages in grid 3, and the
// blue/orange cross-grid digit-correspondence rules) reference grids not
// carried by this puzzle payload and are omitted.

return [
  new Shape('6x6'),
  new Given('R1C2', 2),
  new Given('R2C1', 1),
  new Given('R2C4', 3),
  new Given('R3C3', 4),
  new Given('R4C4', 1),
  new Given('R5C3', 5),
  new Given('R5C6', 2),
  new Given('R6C5', 4),
];
