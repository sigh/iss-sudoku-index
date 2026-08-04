// Title: Allergic Reaction
// Author: Allagem
// Video: https://www.youtube.com/watch?v=gBvMDN_E3Us
// Source: https://app.crackingthecryptic.com/sudoku/fFBPDgBDFD

// Normal sudoku rules apply (default 9x9 grid with standard 3x3 boxes).
// Six thermometers: digits increase from bulb to tip.
// One orange circle: contains an odd digit.
// No orthogonally adjacent pair of digits sums to 10, applied globally since
// no dots or other marks are drawn anywhere on the grid.

// Thermometers, bulb first (drawn cells, from the grey lines and their bulb
// circles).
const thermos = [
  new Thermo('R1C3', 'R1C4', 'R2C4', 'R3C4', 'R4C4'),
  new Thermo('R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'),
  new Thermo('R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6'),
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4'),
  new Thermo('R5C7', 'R6C8', 'R7C8', 'R8C8'),
  new Thermo('R6C2', 'R5C2', 'R4C3'),
];

// Orange circle: an odd-digit restriction, encoded as a multi-value Given.
const oddCircle = new Given('R2C5', 1, 3, 5, 7, 9);

// No adjacent pair sums to 10, over every orthogonally-adjacent edge of the
// main grid (there is no dot/mark family here to leave exceptions for).
// One horizontal-offset Pair and one vertical-offset Pair, each anchored at
// R1C1 and replicated to every cell that has that neighbour (one Replicate
// per relative offset).
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const origin = gridCells[0];
const notTen = Pair.fnToKey((a, b) => a + b !== 10, 9);

const rightNeighbourCells = gridCells.filter(cell => graph.step(cell, 0, 1) !== null);
const downNeighbourCells = gridCells.filter(cell => graph.step(cell, 1, 0) !== null);

const noSumTenRight = graph.makeReplicate(
  new Pair(notTen, '', origin, graph.step(origin, 0, 1)),
  rightNeighbourCells);
const noSumTenDown = graph.makeReplicate(
  new Pair(notTen, '', origin, graph.step(origin, 1, 0)),
  downNeighbourCells);

return [
  new Shape('9x9'),
  ...thermos,
  oddCircle,
  noSumTenRight,
  noSumTenDown,
];
