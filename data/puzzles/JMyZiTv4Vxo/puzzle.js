// Title: Wild apples
// Author: fractalminding
// Video: https://www.youtube.com/watch?v=JMyZiTv4Vxo
// Source: https://sudokupad.app/p6n91xkpkz

// Rules encoded: normal sudoku, plus red dots between orthogonally adjacent
// cells. A dot marks that its pair is non-consecutive AND one digit is even
// while the other is odd. "All dots are given" makes this a global negative
// constraint: every orthogonally adjacent pair *without* a dot must fail
// that same test (so it must be consecutive, or share parity, or both).

const graph = cellGraph('9x9');

// Dot pairs, cited from the payload's `circle` array: each entry's two-cell
// `cells` list is one drawn red dot.
const dotPairs = [
  ['R1C1', 'R1C2'], ['R1C3', 'R1C4'], ['R1C7', 'R1C8'], ['R1C9', 'R1C8'],
  ['R2C3', 'R2C2'], ['R3C3', 'R3C4'], ['R3C4', 'R3C5'], ['R3C7', 'R3C8'],
  ['R4C1', 'R4C2'], ['R4C4', 'R4C5'], ['R4C6', 'R4C7'], ['R4C8', 'R4C9'],
  ['R5C5', 'R5C6'], ['R5C8', 'R5C7'], ['R6C2', 'R6C3'], ['R6C5', 'R6C4'],
  ['R6C5', 'R6C6'], ['R6C8', 'R6C9'], ['R7C2', 'R7C3'], ['R7C4', 'R7C3'],
  ['R7C6', 'R7C5'], ['R7C7', 'R7C8'], ['R7C8', 'R7C9'], ['R8C1', 'R8C2'],
  ['R8C6', 'R8C7'], ['R9C2', 'R9C1'], ['R9C3', 'R9C2'],
  ['R4C2', 'R5C2'], ['R7C2', 'R6C2'], ['R6C3', 'R7C3'], ['R8C3', 'R9C3'],
  ['R9C4', 'R8C4'], ['R5C4', 'R6C4'], ['R2C4', 'R1C4'], ['R2C5', 'R1C5'],
  ['R8C5', 'R7C5'], ['R9C6', 'R8C6'], ['R4C6', 'R5C6'], ['R3C6', 'R2C6'],
  ['R8C7', 'R7C7'], ['R9C7', 'R8C7'], ['R9C8', 'R8C8'], ['R3C8', 'R2C8'],
  ['R3C9', 'R2C9'], ['R4C9', 'R3C9'],
];

// Classify every grid edge (a cell's right-neighbour and down-neighbour) as
// dotted or not, derived from dotPairs rather than hand-enumerated. Keep the
// edge's "from" cell as the Replicate anchor for its direction/class, since
// all edges in one direction/class share the same shift (right: +1 col,
// down: +1 row).
const edgeKey = (a, b) => [a, b].sort().join('-');
const dotKeys = new Set(dotPairs.map(([a, b]) => edgeKey(a, b)));
const rightDot = [], rightNoDot = [], downDot = [], downNoDot = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right) (dotKeys.has(edgeKey(cell, right)) ? rightDot : rightNoDot).push(cell);
  const down = graph.step(cell, 1, 0);
  if (down) (dotKeys.has(edgeKey(cell, down)) ? downDot : downNoDot).push(cell);
}
if (rightDot.length + downDot.length !== dotPairs.length) {
  throw new Error('dot edge count mismatch');
}

const isDotRelation = (a, b) => Math.abs(a - b) !== 1 && (a % 2) !== (b % 2);
const dotKey = Pair.fnToKey(isDotRelation, 9);
const noDotKey = Pair.fnToKey((a, b) => !isDotRelation(a, b), 9);

// One Replicate per (relation, direction): stamps a two-cell Pair template
// anchored at R1C1 (ISS's default Replicate origin) across every anchor cell
// whose edge in that direction belongs to that class.
const dots = [
  graph.makeReplicate(new Pair(dotKey, 'red-dot', 'R1C1', 'R1C2'), rightDot),
  graph.makeReplicate(new Pair(dotKey, 'red-dot', 'R1C1', 'R2C1'), downDot),
];
const noDots = [
  graph.makeReplicate(new Pair(noDotKey, 'no-red-dot', 'R1C1', 'R1C2'), rightNoDot),
  graph.makeReplicate(new Pair(noDotKey, 'no-red-dot', 'R1C1', 'R2C1'), downNoDot),
];

return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  new Given('R1C4', 8),
  new Given('R1C6', 7),
  new Given('R1C9', 5),
  new Given('R4C9', 6),
  new Given('R6C9', 8),
  new Given('R9C9', 2),
  ...dots,
  ...noDots,
];
