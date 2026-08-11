// Title: Redemption
// Author: Andrew B
// Video: https://www.youtube.com/watch?v=17kpmteY5FQ
// Source: https://app.crackingthecryptic.com/sudoku/JGdtQfpN3m

// Rules encoded: normal sudoku (default Shape('9x9') regions/rows/cols);
// AntiKnight (cells a knight's move apart cannot share a digit); Cage
// (killer-cage semantics: distinct digits, sum to total) for each shown
// cage; a custom Pair ratio relation (one value = 3x the other) for each
// drawn blue dot; and, because the rules say "all possible blue dots are
// given", the same relation negated on every other orthogonally-adjacent
// cell pair in the grid (no undrawn edge may hold a 1:3 ratio).

const graph = cellGraph('9x9');

// The three shown cages (each a 2-cell domino with its sum).
const cages = [
  new Cage(14, 'R1C1', 'R2C1'),
  new Cage(13, 'R5C5', 'R6C5'),
  new Cage(13, 'R8C9', 'R9C9'),
];

// The 13 drawn blue-dot edges (each an edge-centered mark between two
// orthogonally adjacent cells).
const dotEdges = [
  ['R1C5', 'R2C5'],
  ['R2C5', 'R2C6'],
  ['R3C2', 'R3C3'],
  ['R3C3', 'R4C3'],
  ['R4C3', 'R4C4'],
  ['R5C3', 'R5C4'],
  ['R4C6', 'R5C6'],
  ['R6C7', 'R6C8'],
  ['R6C8', 'R7C8'],
  ['R7C8', 'R7C9'],
  ['R8C3', 'R8C4'],
  ['R7C4', 'R8C4'],
  ['R7C5', 'R8C5'],
];

const ratioKey = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);
const notRatioKey = Pair.fnToKey((a, b) => a !== 3 * b && b !== 3 * a, 9);

const dots = dotEdges.map(
  ([c1, c2]) => new Pair(ratioKey, 'blue dot 1:3', c1, c2));

// Dotless edges = every orthogonal grid edge minus the drawn dot edges.
const edgeKey = (c1, c2) => [c1, c2].sort().join('-');
const dotEdgeKeys = new Set(dotEdges.map(([c1, c2]) => edgeKey(c1, c2)));
const seenEdges = new Set();
const allEdges = [];
for (const cell of graph.cells()) {
  for (const n of graph.neighbours(cell)) {
    const key = edgeKey(cell, n);
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);
    allEdges.push([cell, n]);
  }
}
// Dotless edges all share one of two offsets (one column right, or one row
// down), so replicate the pair relation from a single template per
// direction instead of repeating ~131 near-identical Pair constraints.
const noDotEdges = allEdges.filter(([c1, c2]) => !dotEdgeKeys.has(edgeKey(c1, c2)));
const horizOrigins = [];
const vertOrigins = [];
for (const [c1, c2] of noDotEdges) {
  const p1 = parseCellId(c1);
  const p2 = parseCellId(c2);
  if (p1.row === p2.row) {
    horizOrigins.push(p1.col < p2.col ? c1 : c2);
  } else {
    vertOrigins.push(p1.row < p2.row ? c1 : c2);
  }
}
const noDots = [
  graph.makeReplicate(
    new Pair(notRatioKey, 'no 1:3 ratio', 'R1C1', 'R1C2'), horizOrigins),
  graph.makeReplicate(
    new Pair(notRatioKey, 'no 1:3 ratio', 'R1C1', 'R2C1'), vertOrigins),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  ...dots,
  ...noDots,
];
