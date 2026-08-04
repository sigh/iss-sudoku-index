// Title: HalfYin-TwoYang
// Author: DJV
// Video: https://www.youtube.com/watch?v=2_U0SVyhWSE
// Source: https://app.crackingthecryptic.com/sudoku/pnnM2dnLrR

// Normal sudoku rules apply (regions are the standard 3x3 boxes; no givens).
// Shade some cells so the shaded cells form one orthogonally-connected
// region and the unshaded cells form another, with no 2x2 area entirely one
// shade. Cage digits may not repeat, and a cage's total is the sum of each
// cell's weighted value: a shaded digit counts as half its face value, an
// unshaded digit counts as double its face value. Several drawn totals are
// themselves half-integers (e.g. "37 1/2"), which is exactly what an odd
// shaded digit produces.
//
// To keep the solver's domain integral, every NFA below tracks 2x the true
// running cage total: a shaded digit d contributes d (= 2*(d/2)) and an
// unshaded digit d contributes 4*d (= 2*(2*d)); matching 2x the drawn total
// is equivalent to matching the drawn total itself.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// 2x2, replicated to every 2x2 origin in the grid.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Cages: [cells, drawn total]. Transcribed from the puzzle's drawn cages.
const cages = [
  [['R1C1', 'R1C2', 'R2C1'], 14],
  [['R1C4', 'R1C5', 'R2C4'], 38],
  [['R2C3', 'R3C3'], 14],
  [['R2C7', 'R3C7', 'R3C8'], 15],
  [['R2C8', 'R2C9'], 19.5],
  [['R3C4', 'R3C5', 'R3C6'], 38],
  [['R4C1', 'R5C1'], 1.5],
  [['R4C2', 'R4C3', 'R4C4'], 6],
  [['R5C6', 'R5C7'], 2.5],
  [['R5C8', 'R6C8'], 21.5],
  [['R6C3', 'R7C3', 'R8C3'], 33],
  [['R7C4', 'R7C5'], 7],
  [['R7C6', 'R8C6'], 13],
  [['R7C7', 'R7C8'], 30],
  [['R7C9', 'R8C9', 'R9C9'], 12],
  [['R9C5', 'R9C6', 'R9C7'], 37.5],
];

// Weighted-total NFA for one cage: scans digit, shade, digit, shade, ...
// (see interleave below) and tracks 2x the running cage total, clamped at
// the doubled target so the state stays bounded.
function cageWeightMachine(doubledTarget) {
  return NFA.encodeSpec({
    startState: { expect: 'digit', sum: 0, pendingDigit: null },
    transition: (state, value) => {
      if (state.expect === 'digit') {
        return { expect: 'shade', sum: state.sum, pendingDigit: value };
      }
      const mult = value === SHADED ? 1 : 4;
      const sum = Math.min(
        state.sum + state.pendingDigit * mult, doubledTarget + 1);
      return { expect: 'digit', sum, pendingDigit: null };
    },
    accept: (state) => state.expect === 'digit' && state.sum === doubledTarget,
  }, geometry.numValues);
}

// A cage's digits are already forced all-different by the row/column/box
// they share, but "digits in a cage may not repeat" is stated directly, so
// state it directly too.
const cageConstraints = cages.flatMap(([cells, total]) => [
  new AllDifferent(...cells),
  new NFA(
    cageWeightMachine(Math.round(total * 2)), 'cage-total',
    ...cells.flatMap(cell => [cell, shade.at(cell)])),
]);

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...cageConstraints,
];
