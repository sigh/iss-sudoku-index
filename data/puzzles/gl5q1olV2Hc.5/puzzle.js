// Title: Marquette
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=gl5q1olV2Hc
// Source: https://tinyurl.com/sust9bcb

// Standard Sudoku givens. Orthogonally adjacent cells cannot be in a 1:2 ratio.
const givens = [
  ['R1C2', 2], ['R1C4', 7], ['R1C8', 9],
  ['R2C1', 5], ['R2C3', 7], ['R2C7', 6], ['R2C9', 8],
  ['R3C2', 6], ['R3C8', 3], ['R4C9', 6], ['R5C5', 4], ['R6C1', 2],
  ['R7C2', 4], ['R7C8', 5], ['R8C1', 1], ['R8C3', 3], ['R8C7', 2],
  ['R8C9', 7], ['R9C2', 7], ['R9C6', 1], ['R9C8', 4],
];

const graph = cellGraph('9x9');
const noRatio = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
// Replicate the horizontal and vertical templates at every in-grid origin where
// the corresponding right or down neighbour exists.
const horizontalOrigins = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalOrigins = graph.cells().filter(cell => graph.step(cell, 1, 0));
const noRatioAdjacencies = [
  graph.makeReplicate(new Pair(noRatio, '', 'R1C1', 'R1C2'), horizontalOrigins),
  graph.makeReplicate(new Pair(noRatio, '', 'R1C1', 'R2C1'), verticalOrigins),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...noRatioAdjacencies,
];
