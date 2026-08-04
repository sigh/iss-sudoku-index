// Title: Safe Distances
// Author: Emphyrio
// Video: https://www.youtube.com/watch?v=aj5nvsxuKYQ
// Source: https://app.crackingthecryptic.com/sudoku/97d8hG6dgH

// Normal sudoku rules apply (default row/column/box all-different).
// Four 3-cell corner cages each sum to 9.
// One outside diagonal clue ("little killer" style): the digits along the
// marked diagonal sum to 28.
// Every orthogonally adjacent pair of cells: the two digits may not sum to
// 3, 4 or 5, and may not be the unordered pair {1,9}, {2,8} or {3,7}.

const graph = cellGraph();

// The diagonal clue's off-grid arrow anchors at the top edge between C5/C6
// and runs down-left into the grid.
const littleKillerCells = ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'];

// One relation covering both adjacency rules: forbidden sums {3,4,5}, and the
// specific forbidden pairs {1,9},{2,8},{3,7} (checked both orderings, since
// Pair's key is not auto-symmetrized).
const forbiddenSums = new Set([3, 4, 5]);
const forbiddenPairs = new Set(['1,9', '9,1', '2,8', '8,2', '3,7', '7,3']);
const safeDistanceKey = Pair.fnToKey(
  (a, b) => !forbiddenSums.has(a + b) && !forbiddenPairs.has(`${a},${b}`),
  9);

// Every orthogonally adjacent cell pair, applied once via two translated
// Replicate templates (horizontal and vertical dominoes), anchored at R1C1
// like graph.makeReplicate expects; targets are every cell that has a right
// (resp. down) neighbour still on the grid.
const cells = graph.cells();
const horizontalStarts = cells.filter(cell => graph.step(cell, 0, 1) !== null);
const verticalStarts = cells.filter(cell => graph.step(cell, 1, 0) !== null);

return [
  new Shape('9x9'),

  new Given('R5C2', 4),
  new Given('R8C5', 4),

  new Cage(9, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(9, 'R8C9', 'R9C9', 'R9C8'),
  new Cage(9, 'R8C1', 'R9C1', 'R9C2'),

  LittleKiller.fromCells(28, littleKillerCells, graph.gridGeometry()),

  graph.makeReplicate(
    new Pair(safeDistanceKey, 'SafeDistance', 'R1C1', 'R1C2'), horizontalStarts),
  graph.makeReplicate(
    new Pair(safeDistanceKey, 'SafeDistance', 'R1C1', 'R2C1'), verticalStarts),
];
