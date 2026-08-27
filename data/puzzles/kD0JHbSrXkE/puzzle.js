// Title: Happy Independence Day
// Author: Debabrata
// Video: https://www.youtube.com/watch?v=kD0JHbSrXkE
// Source: https://sudokupad.app/v9zyy27srq

// Normal Sudoku rules apply. Orthogonally adjacent cells have a difference
// of at least 3. The blue cell (R4C7) contains an even digit.
// Givens are transcribed from the source grid. The payload also paints
// saffron/white/green backgrounds on the other givens (an Independence Day
// theme); those colours carry no rule, so only the blue cell is encoded.
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const differenceAtLeastThree = Pair.fnToKey((a, b) => Math.abs(a - b) >= 3, 9);
const horizontalOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const verticalOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));

// Each replicate applies the shown adjacent pair to every in-grid origin where
// its right or lower neighbour exists, covering every orthogonal adjacency once.
const horizontalDifferences = graph.makeReplicate(
  new Pair(differenceAtLeastThree, 'orthogonal difference at least 3', 'R1C1', 'R1C2'),
  horizontalOrigins);
const verticalDifferences = graph.makeReplicate(
  new Pair(differenceAtLeastThree, 'orthogonal difference at least 3', 'R1C1', 'R2C1'),
  verticalOrigins);

return [
  new Shape('9x9'),
  new Given('R1C4', 1),
  new Given('R1C5', 5),
  new Given('R7C3', 8),
  new Given('R7C9', 4),
  new Given('R8C9', 7),
  horizontalDifferences,
  verticalDifferences,
  // "The blue cell contains an even number." No Odd/Even class exists, so
  // encode as a multi-value Given.
  new Given('R4C7', 2, 4, 6, 8),
];
