// Title: EnTropic Islands
// Author: Paletron
// Video: https://www.youtube.com/watch?v=yLtSakd0dps
// Source: https://app.crackingthecryptic.com/sudoku/PgPqh88p3j

// Rules encoded here, in full:
//  * Normal sudoku.
//  * Entropy groups are the digit triples 1-3 (low), 4-6 (middle) and 7-9
//    (high). An entropic island is a maximal orthogonally connected set of
//    cells whose digits share one entropy group.
//  * The digit in a circled cell is the number of cells in the island that
//    circled cell belongs to.
//  * The `>` drawn on the border between R3C1 and R3C2 points at the smaller
//    of the two digits.
//
// The islands are not drawn, so each circled cell's island is carried by a Var
// overlay: OUT, or the label of the circle whose island the cell is in. One
// overlay per circle is past the Var-cell budget; three facts let several
// circles share one overlay:
//   - A circled cell's digit is its island's size, so the island has at most 9
//     cells and any island cell is at most 8 orthogonal steps from the circle.
//   - Two circles in one island would both hold that island's size as their
//     digit, so they could not share a row, column or box.
//   - Hence two circles that share a row, column or box, or that stand more
//     than 8 steps apart, are always in different islands, and their islands
//     are disjoint. Their labels can live on one overlay.
// Circles are greedily coloured so that any two circles which could share an
// island land on different overlays.

// The 14 empty circles, one per circled cell, read off the drawn overlays.
const CIRCLES = [
  'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R4C1', 'R7C1', 'R9C2', 'R9C9', 'R9C6',
  'R1C8', 'R3C8', 'R3C4', 'R4C7', 'R7C6',
];
// The one `>` glyph, on the vertical border between these two cells, point
// first: it faces right, so R3C2 is the smaller digit.
const GREATER_PAIR = ['R3C1', 'R3C2'];

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues;
const gridCells = graph.cells();

// A circle's digit is its island's size, so an island holds at most numValues
// cells and is spanned by at most numValues - 1 orthogonal steps.
const MAX_ISLAND = numValues;
const boxOf = ({ row, col }) =>
  Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
const distance = (a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return Math.abs(p.row - q.row) + Math.abs(p.col - q.col);
};
const sameSudokuUnit = (a, b) => {
  const p = parseCellId(a), q = parseCellId(b);
  return p.row === q.row || p.col === q.col || boxOf(p) === boxOf(q);
};
// Two circles could be in one island only if their (equal) digits could sit in
// both cells and the island could reach from one to the other.
const couldShareIsland = (a, b) =>
  !sameSudokuUnit(a, b) && distance(a, b) <= MAX_ISLAND - 1;

// Greedy colouring, densest circle first, of the "could share an island" graph.
const clashes = CIRCLES.map(
  a => CIRCLES.filter(b => b !== a && couldShareIsland(a, b)));
const layerOf = new Map();
const byDegree = CIRCLES.map((cell, i) => ({ cell, i }))
  .sort((x, y) => clashes[y.i].length - clashes[x.i].length || x.i - y.i);
for (const { cell, i } of byDegree) {
  const used = new Set(clashes[i].map(other => layerOf.get(other)));
  let layer = 0;
  while (used.has(layer)) layer++;
  layerOf.set(cell, layer);
}

// OUT is the value for "not in any island this overlay tracks"; the circles an
// overlay carries take the values above it, in the order CIRCLES lists them.
const OUT = 1;
const PREFIXES = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH'];
const numLayers = Math.max(...layerOf.values()) + 1;
const layers = Array.from({ length: numLayers }, (_, index) => {
  const circles = CIRCLES.filter(cell => layerOf.get(cell) === index)
    .map((cell, i) => ({ cell, label: OUT + 1 + i }));
  if (circles.length + 1 > numValues) throw new Error('layer needs too many labels');
  return { prefix: PREFIXES[index], overlay: graph.makeOverlay(PREFIXES[index]), circles };
});

// Every overlay cell is OUT or one of that overlay's labels.
const domains = layers.map(({ overlay, circles }) => overlay.makeReplicate(
  new Given(overlay.cells()[0], OUT, ...circles.map(c => c.label))));

// Every circle is in its own island.
const anchors = layers.flatMap(({ overlay, circles }) =>
  circles.map(({ cell, label }) => new Given(overlay.at(cell), label)));

// Each label's cells are one orthogonally connected region.
const connected = layers.flatMap(({ prefix, circles }) =>
  circles.map(({ label }) => new ConnectedValues(prefix, label)));

// Islands are maximal same-entropy regions, which for one overlay reads: for
// two orthogonally adjacent cells, at least one of them labelled, the digits
// share an entropy group exactly when the labels agree. Two cells both OUT are
// unconstrained -- they may be in a common island this overlay does not track.
// Read as [label of cell A, label of cell B, digit of A, digit of B].
const entropyOf = (digit) => Math.ceil(digit / 3);
const islandNFA = NFA.encodeSpec({
  startState: { phase: 'labelA' },
  transition: (state, value) => {
    if (state.phase === 'labelA') return { phase: 'labelB', a: value };
    if (state.phase === 'labelB') {
      if (state.a === OUT && value === OUT) return { phase: 'skip', seen: 0 };
      return { phase: 'digitA', same: state.a === value };
    }
    if (state.phase === 'skip') {
      return state.seen === 0 ? { phase: 'skip', seen: 1 } : { done: true };
    }
    if (state.phase === 'digitA') {
      return { phase: 'digitB', same: state.same, entropy: entropyOf(value) };
    }
    return (entropyOf(value) === state.entropy) === state.same
      ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const adjacentPairs = gridCells.flatMap(cell => [[0, 1], [1, 0]].flatMap(
  ([dRow, dCol]) => {
    const other = graph.step(cell, dRow, dCol);
    return other ? [[cell, other]] : [];
  }));
const islandRules = layers.flatMap(({ overlay }) => adjacentPairs.map(
  ([a, b]) => new NFA(islandNFA, 'island', overlay.at(a), overlay.at(b), a, b)));

// The circled digit is the island's size: one branch per digit, pairing that
// digit with a count of the label's cells. ConnectedValues above is asserted
// outside the branch, so only the cell count belongs here.
const sizeRules = layers.flatMap(({ overlay, circles }) => circles.map(
  ({ cell, label }) => new Or(
    Array.from({ length: numValues }, (_, i) => i + 1).map(size => new And([
      new Given(cell, size),
      new ContainExact(
        Array(size).fill(label).join('_'), ...overlay.cells()),
    ])))));

return [
  new Shape('9x9'),
  ...layers.map(({ overlay, prefix }) => overlay.toVar(`islands-${prefix}`)),
  ...domains,
  ...anchors,
  ...connected,
  ...islandRules,
  ...sizeRules,
  new GreaterThan(...GREATER_PAIR),
];
