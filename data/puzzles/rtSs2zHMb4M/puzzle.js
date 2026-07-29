// Title: Two Apart Sudoku
// Author: Debabrata
// Video: https://www.youtube.com/watch?v=rtSs2zHMb4M
// Source: https://app.crackingthecryptic.com/8pndh89Ptm

// Normal Sudoku rules apply. Orthogonally adjacent cells differ by at least 3.
// The grey circles at R3C7 and R7C3 contain odd digits.
// Givens are transcribed from the source grid.
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
  new Given('R2C5', 5),
  new Given('R4C4', 3),
  new Given('R5C2', 7),
  new Given('R5C8', 3),
  new Given('R6C6', 1),
  new Given('R8C5', 8),
  horizontalDifferences,
  verticalDifferences,
  new Given('R3C7', 1, 3, 5, 7, 9),
  new Given('R7C3', 1, 3, 5, 7, 9),
];
