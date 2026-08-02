// Title: 9/17/23: Consecutive Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=gl5q1olV2Hc
// Source: https://tinyurl.com/437avpbf

// Standard Sudoku rules apply. White dots/bars join consecutive digits, and
// every unmarked orthogonally adjacent pair is non-consecutive.
const DOTS = [
  ['R3C3', 'R3C4'], ['R4C3', 'R4C4'], ['R6C6', 'R6C7'],
  ['R7C6', 'R7C7'], ['R3C6', 'R3C7'], ['R4C6', 'R4C7'],
  ['R6C3', 'R6C4'], ['R7C3', 'R7C4'], ['R5C7', 'R5C8'],
  ['R5C2', 'R5C3'], ['R2C5', 'R3C5'], ['R7C5', 'R8C5'],
  ['R2C2', 'R2C3'], ['R8C7', 'R8C8'], ['R2C9', 'R3C9'],
  ['R7C1', 'R8C1'], ['R2C1', 'R2C2'], ['R8C8', 'R8C9'],
]; // The drawn white-dot/bar pairs.

const graph = cellGraph('9x9');
const edgeKey = (a, b) => [a, b].sort().join('~');
const dotEdges = new Set(DOTS.map(([a, b]) => edgeKey(a, b)));
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
// Every non-dot horizontal or vertical edge uses the same pair predicate. The
// two Replicate templates cover every such edge once from its left/top endpoint.
const starts = (dR, dC) => graph.cells().filter(cell => {
  const other = graph.step(cell, dR, dC);
  return other && !dotEdges.has(edgeKey(cell, other));
});
const negativeEdges = [
  graph.makeReplicate(
    new Pair(notConsecutive, 'not consecutive', 'R1C1', 'R1C2'),
    starts(0, 1),
  ),
  graph.makeReplicate(
    new Pair(notConsecutive, 'not consecutive', 'R1C1', 'R2C1'),
    starts(1, 0),
  ),
];

return [
  new Shape('9x9'),
  new Given('R2C5', 8), new Given('R3C3', 2), new Given('R3C7', 6),
  new Given('R4C4', 4), new Given('R4C6', 8), new Given('R5C2', 8),
  new Given('R5C8', 2), new Given('R6C4', 2), new Given('R6C6', 6),
  new Given('R7C3', 4), new Given('R7C7', 8), new Given('R8C5', 2),
  ...negativeEdges,
  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
