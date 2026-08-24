// Title: 1/11 Sudoku
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=WLSHtt0b5Yk
// Source: https://app.crackingthecryptic.com/sudoku/bdhjghjb76

// Rules: normal sudoku; outside diagonal-sum clues (repeats allowed on the
// diagonal, since the rule states only a sum); white dots mark consecutive
// adjacent pairs, and "all possible dots are shown" makes the dot family
// exhaustive, so every undotted adjacent pair is constrained to NOT be
// consecutive.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside diagonal-sum clues (LittleKiller). Direction of each diagonal is
// fixed by its drawn off-grid stub arrow; all eight circled totals read
// "11", matching the title.
const diagonals = [
  ['R1C7', 1, 1],   // arrow #0
  ['R1C8', 1, 1],   // arrow #1
  ['R9C2', -1, -1], // arrow #2
  ['R7C9', 1, -1],  // arrow #3
  ['R8C9', 1, -1],  // arrow #4
  ['R9C3', -1, -1], // arrow #5
  ['R3C1', -1, 1],  // arrow #6
  ['R2C1', -1, 1],  // arrow #7
];
const littleKillers = diagonals.map(([start, dr, dc]) =>
  LittleKiller.fromCells(11, graph.ray(start, dr, dc), geometry));

// Drawn white-dot edges (edge-sized rounded overlay marks).
const dotEdges = [
  ['R2C1', 'R3C1'],
  ['R2C1', 'R2C2'],
  ['R1C5', 'R2C5'],
  ['R1C7', 'R1C8'],
  ['R2C8', 'R2C9'],
  ['R5C8', 'R6C8'],
  ['R5C5', 'R5C6'],
  ['R4C4', 'R4C5'],
  ['R5C4', 'R6C4'],
  ['R7C1', 'R8C1'],
  ['R9C2', 'R9C3'],
  ['R8C4', 'R9C4'],
  ['R9C5', 'R9C6'],
  ['R7C6', 'R8C6'],
  ['R7C9', 'R8C9'],
];
const edgeKey = (a, b) => [a, b].sort().join('-');
const dotEdgeSet = new Set(dotEdges.map(([a, b]) => edgeKey(a, b)));

const whiteDots = dotEdges.map(([a, b]) => new WhiteDot(a, b));

// Every other orthogonally-adjacent pair, derived from the grid graph itself
// (not hand-enumerated), must NOT be consecutive.
const allEdges = [];
const seenEdges = new Set();
for (const cell of graph.cells()) {
  for (const n of graph.neighbours(cell)) {
    const key = edgeKey(cell, n);
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);
    allEdges.push([cell, n]);
  }
}
const nonDotEdges = allEdges.filter(([a, b]) => !dotEdgeSet.has(edgeKey(a, b)));

// Normalise each edge to (start, end) with start = the row-major-earlier
// cell, so within one direction every edge is a fixed +1 (horizontal) or +9
// (vertical) index shift of its start cell -- required for Replicate.
const normalised = nonDotEdges.map(([a, b]) => {
  const pa = geometry.parseCellId(a);
  const pb = geometry.parseCellId(b);
  return pa.cellIndex < pb.cellIndex ? [a, b] : [b, a];
});
const horizontal = normalised.filter(([a, b]) =>
  geometry.parseCellId(a).row === geometry.parseCellId(b).row);
const vertical = normalised.filter(([a, b]) =>
  geometry.parseCellId(a).col === geometry.parseCellId(b).col);

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// One Replicate per direction: every undotted edge in a direction is the
// same index shift of its start cell.
const replicateDirection = (edges) => {
  const [templateStart, templateEnd] = edges[0];
  return new Replicate(
    [new Pair(notConsecutive, 'not consecutive', templateStart, templateEnd)],
    Replicate.encodeTargetCells(edges.map(([a]) => a), templateStart, graph),
    templateStart,
  );
};

return [
  new Shape('9x9'),

  ...littleKillers,
  ...whiteDots,
  replicateDirection(horizontal),
  replicateDirection(vertical),
];
