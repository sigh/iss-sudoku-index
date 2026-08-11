// Title: Aqre Sudoku
// Author: Superrabbit
// Video: https://www.youtube.com/watch?v=9wUnyeX2SRs
// Source: https://app.crackingthecryptic.com/sudoku/rq7j4ttqnn

// Full encoding. Normal sudoku rules apply (default Shape('9x9')). Shade some
// cells so that all shaded cells form one orthogonally connected area; the
// given digit in each box also states how many of that box's cells are
// shaded (one given per box, transcribed from the drawn grid); no run of
// more than three consecutive shaded or unshaded cells may appear in any row
// or column; a shaded cell's digit must exceed the digit of any orthogonally
// adjacent unshaded cell.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// One given per box: also a normal sudoku digit at that cell.
const GIVENS = {
  'R1C6': 5, 'R3C3': 1, 'R3C9': 5, 'R4C3': 4, 'R4C4': 7,
  'R5C7': 5, 'R7C5': 6, 'R8C8': 3, 'R9C1': 7,
};
const givens = Object.entries(GIVENS).map(
  ([cell, value]) => new Given(cell, value));

// Box shaded-cell counts. sum(overlay values in box) = SHADED*shaded +
// UNSHADED*(9-shaded) = 9*UNSHADED - shaded, so pin that sum to
// 9*UNSHADED - count to force exactly `count` shaded cells in the box.
const boxShadedCounts = graph.boxes().map(box => {
  const givenCell = box.find(cell => GIVENS[cell] !== undefined);
  const count = GIVENS[givenCell];
  return new Sum(UNSHADED * box.length - count, ...shade.at(box));
});

// Shaded cells form one connected region (unshaded connectivity is not a
// stated rule, so only the shaded value set is asserted).
const shadedConnected = new ConnectedValues('VS', SHADED);

// No run of more than three consecutive shaded or unshaded cells in any row
// or column: an NFA over the shade overlay that tracks the length of the
// current same-value run and rejects on a fourth repeat.
const runLengthMachine = NFA.encodeSpec({
  startState: { prev: null, run: 0 },
  transition: ({ prev, run }, value) => {
    const nextRun = value === prev ? run + 1 : 1;
    if (nextRun > 3) return undefined;
    return { prev: value, run: nextRun };
  },
  accept: () => true,
}, geometry.numValues);
const noLongRuns = [...shade.rows(), ...shade.columns()].map(
  (line, i) => new NFA(runLengthMachine, `no-long-run-${i}`, ...line));

// Shaded-digit > adjacent-unshaded-digit, and vice versa, applied per
// orthogonal edge. The four branches are exhaustive over the two cells'
// (shade, shade) combinations: the two same-shade branches add no digit
// requirement, the two opposite-shade branches add the directed GreaterThan.
function edgePairs() {
  const pairs = [];
  for (const cell of graph.cells()) {
    const right = graph.step(cell, 0, 1);
    if (right) pairs.push([cell, right]);
    const down = graph.step(cell, 1, 0);
    if (down) pairs.push([cell, down]);
  }
  return pairs;
}
const shadeOrdering = edgePairs().map(([a, b]) => {
  const [sa, sb] = shade.at([a, b]);
  return new Or([
    new And([new Given(sa, SHADED), new Given(sb, SHADED)]),
    new And([new Given(sa, UNSHADED), new Given(sb, UNSHADED)]),
    new And([new Given(sa, SHADED), new Given(sb, UNSHADED), new GreaterThan(a, b)]),
    new And([new Given(sa, UNSHADED), new Given(sb, SHADED), new GreaterThan(b, a)]),
  ]);
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  ...givens,
  ...boxShadedCounts,
  shadedConnected,
  ...noLongRuns,
  ...shadeOrdering,
];
