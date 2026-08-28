// Title: Diagonal Kropki Sudoku
// Author: Madmahogany
// Video: https://www.youtube.com/watch?v=6e3yuHGYkHw
// Source: https://cracking-the-cryptic.web.app/sudoku/tNrLppJNF7

// Rules encoded:
// - Normal sudoku rules.
// - Both marked diagonals hold 1-9 exactly once: Diagonal(-1) (top-left to
//   bottom-right) and Diagonal(1) (top-right to bottom-left).
// - White dot: orthogonally-adjacent cells holding consecutive digits are
//   marked; "all possible white ... dots are provided" makes this an iff, so
//   every unmarked orthogonal edge must NOT hold consecutive digits.
// - Grey dot: cells that are immediate neighbours along one of the two
//   marked diagonals holding consecutive digits are marked; "all possible
//   ... grey dots are provided" makes this an iff too, scoped to the 16
//   diagonal-neighbour edges (8 per diagonal).
// - Anti-taxicab: no two same-valued cells sit at a taxicab distance equal
//   to their shared value. This is exactly the built-in AntiTaxicab rule.

const graph = cellGraph('9x9');

// White dot pairs -- provenance: the drawn white rounded edge marks.
const whiteDotPairs = [
  ['R1C2', 'R1C3'], ['R1C3', 'R1C4'], ['R2C1', 'R2C2'], ['R2C3', 'R3C3'],
  ['R2C4', 'R3C4'], ['R1C5', 'R2C5'], ['R1C5', 'R1C6'], ['R1C6', 'R1C7'],
  ['R1C7', 'R1C8'], ['R2C7', 'R2C8'], ['R3C8', 'R3C9'], ['R5C8', 'R5C9'],
  ['R6C7', 'R6C8'], ['R7C8', 'R7C9'], ['R8C7', 'R8C8'], ['R8C9', 'R9C9'],
  ['R5C3', 'R6C3'], ['R6C3', 'R7C3'], ['R6C2', 'R7C2'], ['R4C1', 'R4C2'],
  ['R3C1', 'R4C1'], ['R4C3', 'R4C4'], ['R4C5', 'R5C5'], ['R4C6', 'R4C7'],
  ['R7C3', 'R7C4'], ['R7C4', 'R8C4'], ['R7C5', 'R8C5'], ['R8C1', 'R8C2'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

// Grey dot pairs -- provenance: the drawn grey corner marks, each read
// against the one marked-diagonal pair its 2x2 quad actually straddles (the
// quad's other diagonal is not on either marked diagonal, so there is no
// one-pair-per-mark ambiguity).
const greyDotPairs = [
  ['R2C2', 'R3C3'], ['R4C6', 'R5C5'], ['R7C7', 'R8C8'],
];

const consecutive = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9);
const notConsecutive = Pair.fnToKey((a, b) => a !== b + 1 && a !== b - 1, 9);
const greyDots = greyDotPairs.map(
  ([a, b], i) => new Pair(consecutive, `grey-dot-${i}`, a, b));

// Every unmarked orthogonal edge must NOT hold consecutive digits (the "all
// dots provided" exhaustiveness). Derive it from the grid graph minus the
// drawn white-dot edges, rather than re-listing the grid by hand. Each
// offset direction (rightward, downward) becomes one Replicate: the
// template pair is shifted from its origin onto every other edge with the
// same offset, instead of stamping one Pair per edge.
const edgeKey = (a, b) => [a, b].sort().join('-');
const whiteDotSet = new Set(whiteDotPairs.map(([a, b]) => edgeKey(a, b)));
const rightEdges = [];
const downEdges = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right && !whiteDotSet.has(edgeKey(cell, right))) rightEdges.push([cell, right]);
  const down = graph.step(cell, 1, 0);
  if (down && !whiteDotSet.has(edgeKey(cell, down))) downEdges.push([cell, down]);
}

// Every unmarked edge between immediate neighbours along either marked
// diagonal must NOT hold consecutive digits (same exhaustiveness, scoped to
// the 16 diagonal-neighbour edges): one Replicate per diagonal direction.
const greyDotSet = new Set(greyDotPairs.map(([a, b]) => edgeKey(a, b)));
const downRightEdges = [];
const downLeftEdges = [];
for (let i = 1; i < 9; i++) {
  const a1 = makeCellId(i, i), b1 = makeCellId(i + 1, i + 1);
  if (!greyDotSet.has(edgeKey(a1, b1))) downRightEdges.push([a1, b1]);
  const a2 = makeCellId(i, 10 - i), b2 = makeCellId(i + 1, 9 - i);
  if (!greyDotSet.has(edgeKey(a2, b2))) downLeftEdges.push([a2, b2]);
}

// Build one Replicate per offset group: the first edge is the template, the
// rest are targets the template is translated onto.
const replicateNotConsecutive = (edges, label) => {
  if (edges.length === 0) return [];
  const [origin, originPartner] = edges[0];
  const template = new Pair(notConsecutive, label, origin, originPartner);
  const targets = edges.map(([a]) => a);
  return [new Replicate(
    [template], Replicate.encodeTargetCells(targets, origin, graph), origin)];
};
const noDotEdges = [
  ...replicateNotConsecutive(rightEdges, 'no-dot-right'),
  ...replicateNotConsecutive(downEdges, 'no-dot-down'),
  ...replicateNotConsecutive(downRightEdges, 'no-dot-down-right'),
  ...replicateNotConsecutive(downLeftEdges, 'no-dot-down-left'),
];

return [
  new Shape('9x9'),
  new Given('R5C6', 1),
  new Given('R6C3', 5),
  new Given('R8C7', 3),
  new Diagonal(-1),
  new Diagonal(1),
  ...whiteDots,
  ...greyDots,
  ...noDotEdges,
  new AntiTaxicab(),
];
