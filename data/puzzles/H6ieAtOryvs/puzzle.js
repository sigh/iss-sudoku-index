// Title: Confetti Sums Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=H6ieAtOryvs
// Source: https://cracking-the-cryptic.web.app/sudoku/3FN9p4Hm83

// Standard 9x9 sudoku. In every case where the sum of two orthogonally
// adjacent digits equals A, B, or C, a circle is drawn on that edge: white
// for A, grey for B, black for C. A, B, C are distinct and unknown -- part
// of the puzzle is finding them. The rule runs both ways: an edge without a
// circle has a sum that is none of A, B, or C.
//
// A/B/C are modelled as a 3-cell Var group (VD1=A/white, VD2=B/grey,
// VD3=C/black) on a widened alphabet, since a two-digit sum can reach 17,
// two past the 16-value cap on a Shape alphabet. Every sum Var (A/B/C and
// each uncircled pair's sum below) is stored shifted down by SUM_SHIFT, so
// it fits the alphabet; every place it is used is a Sum-tie or an
// AllDifferent, both translation-invariant, so the shift does not change
// what is enforced. Each drawn circle's two cells are tied to its colour's
// Var by a Sum equation (`Sum(k, x, y, [var, -1])` means x + y - var = k,
// i.e. var == x + y - k). Every other orthogonally adjacent pair gets its
// own sum Var, computed the same way, then AllDifferent'd against
// VD1/VD2/VD3 so it cannot equal A, B, or C -- the "no circle" half of the
// rule. The unmarked-edge list is computed from the full adjacency graph
// minus the drawn edges, not hand-enumerated.

const SUM_SHIFT = 2; // two-digit sums run 3-17; shifted they run 1-15

const shape = new Shape('9x9', 17 - SUM_SHIFT);
const graph = cellGraph('9x9');

const givens = [
  new Given('R3C2', 3),
  new Given('R5C1', 9),
  new Given('R5C9', 3),
  new Given('R7C8', 8),
];

// Restrict the playable grid back to real sudoku digits 1-9 (Shape widened
// the alphabet to 17 for the sum Vars below).
const gridDigitRange = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Drawn circle edges, transcribed from the puzzle's own overlay geometry.
const whiteEdges = [ // sum = A
  ['R1C6', 'R1C7'], ['R3C1', 'R4C1'], ['R4C4', 'R4C5'], ['R4C7', 'R5C7'],
  ['R5C5', 'R5C6'], ['R6C4', 'R7C4'], ['R6C5', 'R7C5'], ['R7C9', 'R8C9'],
  ['R8C1', 'R8C2'], ['R8C4', 'R8C5'], ['R8C8', 'R9C8'],
];
const greyEdges = [ // sum = B
  ['R1C1', 'R1C2'], ['R1C3', 'R2C3'], ['R2C1', 'R2C2'], ['R5C7', 'R6C7'],
  ['R7C7', 'R8C7'], ['R8C3', 'R9C3'],
];
const blackEdges = [ // sum = C
  ['R1C8', 'R1C9'], ['R2C6', 'R3C6'], ['R4C8', 'R5C8'], ['R5C4', 'R5C5'],
  ['R6C1', 'R6C2'], ['R9C1', 'R9C2'],
];

// VD1 = A (white), VD2 = B (grey), VD3 = C (black).
const dot = new Var('D', 'circle sums A(white)/B(grey)/C(black)', 3);
const [dotA, dotB, dotC] = [dot.cell(1), dot.cell(2), dot.cell(3)];

const dotSumEquations = [
  ...whiteEdges.map(([x, y]) => new Sum(SUM_SHIFT, x, y, [dotA, -1])),
  ...greyEdges.map(([x, y]) => new Sum(SUM_SHIFT, x, y, [dotB, -1])),
  ...blackEdges.map(([x, y]) => new Sum(SUM_SHIFT, x, y, [dotC, -1])),
];
const dotsDistinct = new AllDifferent(dotA, dotB, dotC);

// Every orthogonally adjacent pair in the grid, deduped, minus the drawn
// (circled) edges above -- these are the pairs that must NOT sum to A, B,
// or C.
const edgeKey = (a, b) => [a, b].sort().join('|');
const markedEdgeKeys = new Set(
  [...whiteEdges, ...greyEdges, ...blackEdges].map(([a, b]) => edgeKey(a, b)));

const seenEdgeKeys = new Set();
const allAdjacentPairs = [];
for (const cell of graph.cells()) {
  for (const neighbour of graph.neighbours(cell)) {
    const key = edgeKey(cell, neighbour);
    if (seenEdgeKeys.has(key)) continue;
    seenEdgeKeys.add(key);
    allAdjacentPairs.push([cell, neighbour]);
  }
}
const unmarkedEdges = allAdjacentPairs.filter(
  ([a, b]) => !markedEdgeKeys.has(edgeKey(a, b)));

const unmarkedSum = new Var(
  'U', 'sum of each uncircled adjacent pair', unmarkedEdges.length);
const unmarkedConstraints = unmarkedEdges.flatMap(([x, y], i) => {
  const s = unmarkedSum.cell(i + 1);
  return [
    new Sum(SUM_SHIFT, x, y, [s, -1]),
    new AllDifferent(s, dotA, dotB, dotC), // sum is none of A, B, C
  ];
});

return [
  shape,
  ...givens,
  gridDigitRange,
  dot,
  unmarkedSum,
  ...dotSumEquations,
  dotsDistinct,
  ...unmarkedConstraints,
];
