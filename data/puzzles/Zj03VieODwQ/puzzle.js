// Title: 6/10
// Author: HawkAvatar
// Video: https://www.youtube.com/watch?v=Zj03VieODwQ
// Source: https://app.crackingthecryptic.com/sudoku/PnBnQfpPfR

// 6x6 grid, six of the digits 0-9 (the solver must find which six); one
// copy of each of the six chosen digits per row/column/box. Modelled as a
// widened 0-9 alphabet with RegionSameValues() forcing every row, column
// and box (all size 6, the puzzle's largest regions) to share one 6-digit
// set. Thermometers, arrows and V pairs are given as drawn. "ALL possible
// Vs are given" is a global negative: every orthogonally-adjacent pair not
// marked with a V must not sum to 5 -- encoded below as one Pair per
// unmarked edge, since the puzzle draws no X (sum-10) marks at all and so
// gives no basis for also excluding sum-10 pairs (StrictXV would add that
// unstated exclusion).

const shape = new Shape('6x6', '0-9');

const thermos = [
  new Thermo('R6C1', 'R5C1', 'R4C1', 'R3C1'),
  new Thermo('R5C6', 'R4C6'),
];

const arrows = [
  new Arrow('R1C6', 'R1C5', 'R2C5', 'R2C4', 'R2C3'),
  new Arrow('R6C2', 'R5C2', 'R4C2', 'R3C2', 'R3C3'),
  new Arrow('R3C4', 'R3C5', 'R3C6'),
];

// Provenance: the seven edge-drawn "V" overlays in the source payload.
const vEdges = [
  ['R5C1', 'R6C1'],
  ['R4C2', 'R4C3'],
  ['R2C3', 'R2C4'],
  ['R1C4', 'R2C4'],
  ['R2C5', 'R2C6'],
  ['R3C5', 'R3C6'],
  ['R3C4', 'R4C4'],
];
const vs = vEdges.map(([a, b]) => new V(a, b));

// Every other orthogonally-adjacent pair may not sum to 5, since the rules
// state all Vs are drawn. Derived from the drawn V edges rather than
// hand-enumerated: every grid edge minus the V edges above.
const graph = cellGraph(shape);
const vKeys = new Set(vEdges.map(([a, b]) => [a, b].sort().join('-')));
const notVKey = Pair.fnToKey((a, b) => a + b !== 5, shape);
const notVPairs = [];
for (const cell of graph.cells()) {
  for (const other of [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]) {
    if (!other) continue;
    const key = [cell, other].sort().join('-');
    if (!vKeys.has(key)) notVPairs.push([cell, other]);
  }
}
const notVs = notVPairs.map(([a, b]) => new Pair(notVKey, 'not V', a, b));

return [
  shape,
  new RegionSameValues(),
  ...thermos,
  ...arrows,
  ...vs,
  ...notVs,
];
