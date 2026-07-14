// Title: The fireflies' pairing dance
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=o3619evP8Yc
// Source: https://sudokupad.app/ruz1c8uhcr

// Golden dots mark every orthogonal pair whose sum is divisible by 4.
// The complement is generated over all orthogonal grid edges so the negative
// rule applies even where a positive black or white dot is drawn.

const graph = cellGraph('9x9');

const goldenDots = [
  ['R1C3', 'R2C3'],
  ['R1C4', 'R2C4'],
  ['R2C8', 'R3C8'],
  ['R3C5', 'R3C6'],
  ['R4C5', 'R4C6'],
  ['R4C5', 'R5C5'],
  ['R5C2', 'R5C3'],
  ['R5C2', 'R6C2'],
  ['R5C7', 'R5C8'],
  ['R5C9', 'R6C9'],
  ['R8C3', 'R9C3'],
  ['R8C4', 'R8C5'],
  ['R8C4', 'R9C4'],
  ['R8C8', 'R9C8'],
  ['R9C2', 'R9C3'],
];

const edgeKey = (a, b) => [a, b].sort().join('-');
const goldenEdgeKeys = new Set(goldenDots.map(([a, b]) => edgeKey(a, b)));
const orthogonalEdges = graph.cells().flatMap(cell =>
  graph.neighbours(cell)
    .filter(neighbour => cell < neighbour)
    .map(neighbour => [cell, neighbour]));
const nonGoldenEdges = orthogonalEdges.filter(
  ([a, b]) => !goldenEdgeKeys.has(edgeKey(a, b)));

const replicatePair = (key, name, dRow, dCol, edgeKeys) => {
  const origins = graph.cells().filter(cell => {
    const other = graph.step(cell, dRow, dCol);
    return other !== null && edgeKeys.has(edgeKey(cell, other));
  });
  const origin = origins[0];
  return graph.makeReplicate(
    new Pair(key, name, origin, graph.step(origin, dRow, dCol)), origins);
};

const boxBorderEdges = orthogonalEdges.filter(([a, b]) => {
  const ca = parseCellId(a);
  const cb = parseCellId(b);
  return ca.row !== cb.row
    ? Math.min(ca.row, cb.row) % 3 === 0
    : Math.min(ca.col, cb.col) % 3 === 0;
});

const goldenKey = Pair.fnToKey((a, b) => (a + b) % 4 === 0, 9);
const notGoldenKey = Pair.fnToKey((a, b) => (a + b) % 4 !== 0, 9);
const evenSumKey = Pair.fnToKey((a, b) => (a + b) % 2 === 0, 9);

return [
  new Shape('9x9'),

  ...goldenDots.map(cells => new Pair(goldenKey, 'golden dot', ...cells)),
  ...[[0, 1], [1, 0]].map(([dRow, dCol]) => replicatePair(
    notGoldenKey, 'no golden dot', dRow, dCol,
    new Set(nonGoldenEdges.map(([a, b]) => edgeKey(a, b))))),

  new BlackDot('R4C3', 'R5C3'),
  new BlackDot('R4C9', 'R5C9'),
  new BlackDot('R8C1', 'R8C2'),

  new WhiteDot('R1C5', 'R1C6'),
  new WhiteDot('R7C8', 'R7C9'),

  ...boxBorderEdges.map(cells =>
    new Pair(evenSumKey, 'even sum across box border', ...cells)),
];
