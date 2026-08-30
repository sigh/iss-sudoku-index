// Title: The Schizophrenic Sudoku (all circles odd)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pzVy93NhOzY
// Source: https://cracking-the-cryptic.web.app/sudoku/TPHt967Npg

// Normal Sudoku rules apply (default row/column/box all-different).
// Every cell marked with a grey circle contains an odd digit.
//
// The video presents the grid as a twin puzzle whose 16 grey circles may be
// read as all odd or all even. This script encodes the odd reading, the rule
// stated by the puzzle's original publication (Even/Odd Sudoku by Ashish
// Kumar, gmpuzzles: "cells with a circle contain an odd digit"). The even
// reading is the twin puzzle, encoded separately.
//
// No other clue geometry is drawn.

// Provenance: the 20 digits printed in the grid.
const givens = [
  new Given('R1C5', 4),
  new Given('R1C8', 9),
  new Given('R2C6', 9),
  new Given('R2C9', 6),
  new Given('R3C3', 9),
  new Given('R3C7', 7),
  new Given('R4C4', 7),
  new Given('R4C8', 6),
  new Given('R5C1', 1),
  new Given('R5C5', 6),
  new Given('R5C9', 5),
  new Given('R6C2', 2),
  new Given('R6C6', 5),
  new Given('R7C3', 3),
  new Given('R7C7', 4),
  new Given('R8C1', 2),
  new Given('R8C4', 4),
  new Given('R8C8', 5),
  new Given('R9C2', 7),
  new Given('R9C5', 5),
];

// Provenance: the 16 grey-filled circular underlays, one per cell.
const oddCells = [
  'R1C4', 'R2C3', 'R2C5', 'R3C2', 'R3C6', 'R4C1',
  'R4C7', 'R5C2', 'R5C8', 'R6C3', 'R6C9', 'R7C4',
  'R7C8', 'R8C5', 'R8C7', 'R9C6',
];
const oddCircles = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),
  ...givens,
  ...oddCircles,
];
