// Title: World's Smallest Puzzle Hunt 1
// Author: Clover
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://app.crackingthecryptic.com/sudoku/GJbrQ3j6Bp

// Grid 1 of a three-grid hunt, sharing one rules text with grids 2 and 3:
// "In all three grids, 1-6 must appear in each row, column and marked region.
// In grid 2, digits must increase along thermometers from the bulb end. In
// grid 3, digits in cages cannot repeat and must sum to the total given. Blue
// cells contain the same digit in the same order in grids 1 and 2. Orange
// cells contain the same digit in the same order in grids 2 and 3."
//
// The thermometer clause names grid 2 and the cage clause names grid 3, so
// neither applies here. The drawn regions are the standard 2x3 box partition
// of a 6-wide grid, which Shape('6x6') already supplies.
//
// The blue clause reads the four blue cells R2C2, R2C5, R5C2, R5C5 across into
// grid 2's blue cells. It fixes grid 2's digits from grid 1's, not the other
// way round: grid 1 is a complete 6x6 sudoku on its own, so those four digits
// follow from the row/column/region rule already encoded below. Grid 2 is a
// separate puzzle and its cells are not part of this grid.

return [
  new Shape('6x6'),
  // Givens as printed in the source grid.
  new Given('R1C2', 2),
  new Given('R2C1', 1),
  new Given('R2C4', 3),
  new Given('R3C3', 4),
  new Given('R4C4', 1),
  new Given('R5C3', 5),
  new Given('R5C6', 2),
  new Given('R6C5', 4),
];
