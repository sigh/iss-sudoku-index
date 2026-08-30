// Title: Odd-Angle Sudoku
// Author: Adam R Wood
// Video: https://www.youtube.com/watch?v=DXtt6vcfQug
// Source: https://cracking-the-cryptic.web.app/sudoku/B2HR2pNTFq

// Rules: normal sudoku, plus no odd digit appears more than once within any
// diagonal line of length 2 or more, in either diagonal direction. The
// grid's light-grey checkerboard fill is a solving aid the rules text calls
// "for your convenience", not a separate rule -- every cell on one diagonal
// always shares one checkerboard colour -- so it is decorative and left
// unencoded.

// Every diagonal line of length >= 2, both directions, is exactly what
// LittleKiller.cellMap() enumerates (it already dedupes each diagonal to one
// entry and drops the four single-cell corners, which can never repeat a
// digit anyway).
const diagonals = Object.values(LittleKiller.cellMap(cellGeometry('9x9')));

// No odd digit may repeat within a diagonal; even digits may repeat freely.
// PairX applies the relation between every pair of cells in each diagonal.
const noRepeatedOddKey = PairX.fnToKey((a, b) => !(a === b && a % 2 === 1), 9);
const oddDiagonalConstraints = diagonals.map(
  cells => new PairX(noRepeatedOddKey, 'no repeated odd digit', ...cells));

return [
  new Shape('9x9'),

  // Given digits, as printed in the grid.
  new Given('R1C3', 4),
  new Given('R1C4', 6),
  new Given('R1C7', 3),
  new Given('R2C1', 6),
  new Given('R2C6', 2),
  new Given('R3C2', 2),
  new Given('R4C3', 5),
  new Given('R4C9', 6),
  new Given('R5C5', 3),
  new Given('R6C1', 2),
  new Given('R6C7', 7),
  new Given('R7C8', 6),
  new Given('R8C4', 4),
  new Given('R8C9', 3),
  new Given('R9C3', 7),
  new Given('R9C6', 6),
  new Given('R9C7', 9),

  ...oddDiagonalConstraints,
];
