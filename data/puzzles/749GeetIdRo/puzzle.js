// Title: Covert Confinement
// Author: SSG
// Video: https://www.youtube.com/watch?v=749GeetIdRo
// Source: https://app.crackingthecryptic.com/sudoku/MD2fPgdNbf

// Rules encoded here:
//   * Normal sudoku rules apply (rows, columns and the nine 3x3 boxes are
//     each all-different).
//   * Shade some cells so that all shaded cells form a single orthogonally
//     connected region and no 2x2 block is fully shaded.
//   * The unshaded cells split into maximal orthogonally-connected "unshaded
//     regions" (nothing else can separate unshaded cells from one another,
//     so this is the only reading the payload supports). Each unshaded
//     region must contain exactly one of the ten listed clue cells and is an
//     "X-killer cage": its digits are all different and sum to the clue
//     cell's corner total, and the digit placed on the clue cell itself
//     equals the region's own cell count.
//   * R9C9 (the grey circle) holds an odd digit.
// Nothing is omitted.
//
// Model: one Var per grid cell ('VL' overlay) holds either SHADE or the
// index (1-10) of the cage it belongs to, over a Shape widened to 11 values;
// grid cells are restricted back to 1-9 by one Replicate. Forcing every pair
// of orthogonally-adjacent cells that are BOTH unshaded to carry the same
// label ("boundaryAgreement") is what makes each label's cells coincide with
// one maximal connected unshaded region, rather than an arbitrary
// same-label subset: two differently-labelled but touching unshaded cells
// would otherwise be one physical region holding two clue cells, which the
// rule forbids. `ConnectedValues` then closes each region (and the shaded
// area) into a single connected component. A region's cell count is not
// known in advance (it equals whatever digit ends up on its clue cell), so
// each cage's size is asserted once per size the corner total makes
// arithmetically possible (`Or` of `And(Given(clue, n), ContainExact(n copies
// of the label))`) -- an enumerable-catalogue construction, not an
// approximation. `ConnectedValues` cannot nest inside `Or`/`And`, so cage
// connectivity is asserted unconditionally alongside it instead.

const CAGES = [ // cell, corner total -- transcribed from the drawn corner-total clues
  { cell: 'R2C1', total: 10 },
  { cell: 'R1C4', total: 6 },
  { cell: 'R2C9', total: 36 },
  { cell: 'R5C7', total: 6 },
  { cell: 'R4C4', total: 26 },
  { cell: 'R6C5', total: 5 },
  { cell: 'R7C8', total: 28 },
  { cell: 'R8C7', total: 28 },
  { cell: 'R9C3', total: 29 },
  { cell: 'R7C1', total: 12 },
];
const SHADE = CAGES.length + 1; // 11: the one non-cage label

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('9x9', SHADE);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const label = graph.makeOverlay('VL');

// A cage with n distinct digits (drawn from 1-9) has digit sum between
// 1+..+n and 9+..+(10-n); the clue cell's own digit is one of those n
// digits, so this bound already accounts for it. The corner total must fall
// in that range for size n to be possible at all.
const feasibleSizes = (total) => DIGITS.filter(n => {
  const min = n * (n + 1) / 2;
  const max = n * (19 - n) / 2;
  return total >= min && total <= max;
});

const manhattan = (a, b) => {
  const pa = parseCellId(a), pb = parseCellId(b);
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col);
};

// A connected region of n cells reaches at most n-1 (Manhattan-distance-
// bounded-by-graph-distance) steps from any one of its own cells, so a cell
// further than (max feasible size - 1) from a clue cell can never belong to
// that cage. This only prunes candidate labels; it asserts nothing beyond
// the rule's own size bound above.
const cageInfo = CAGES.map((c, i) => {
  const sizes = feasibleSizes(c.total);
  const radius = Math.max(...sizes) - 1;
  const zone = gridCells.filter(cell => manhattan(cell, c.cell) <= radius);
  return { ...c, label: i + 1, sizes, zone };
});

// Real grid digits stay 1-9; the widened range exists only for cage labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell's label is SHADE, or one of the cage labels whose zone reaches
// it; a clue cell's label is pinned to its own cage.
const labelDomain = gridCells.map(cell => {
  const clue = cageInfo.find(c => c.cell === cell);
  if (clue) return new Given(label.at(cell), clue.label);
  const candidates = cageInfo
    .filter(c => c.zone.includes(cell))
    .map(c => c.label);
  return new Given(label.at(cell), SHADE, ...candidates);
});

// Two orthogonally-adjacent cells that are both unshaded must carry the same
// cage label -- see the header note on why this is what turns "same label"
// into "the maximal connected unshaded region". One horizontal and one
// vertical template, each replicated to every valid origin, rather than one
// Pair per edge.
const boundaryKey = Pair.fnToKey(
  (a, b) => a === SHADE || b === SHADE || a === b, geometry);
const origin = gridCells[0];
const horizOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const vertOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const boundaryAgreement = [
  label.makeReplicate(
    new Pair(boundaryKey, 'cage-boundary-agreement-h',
      ...label.at([origin, graph.step(origin, 0, 1)])),
    label.at(horizOrigins)),
  label.makeReplicate(
    new Pair(boundaryKey, 'cage-boundary-agreement-v',
      ...label.at([origin, graph.step(origin, 1, 0)])),
    label.at(vertOrigins)),
];

// The shaded cells form one orthogonally-connected region, and so does each
// cage (whatever size it turns out to be) -- ConnectedValues cannot nest
// inside Or/And, so this is asserted once per cage, unconditionally, rather
// than inside the size branches below.
const shadeConnectivity = new ConnectedValues('VL', SHADE);
const cageConnectivity = cageInfo.map(c => new ConnectedValues('VL', c.label));

// No 2x2 block of cells may be entirely shaded: one NFA on the top-left
// block, replicated to every block origin (same pattern as a "no monochrome
// 2x2" check, but only the all-SHADE case is forbidden here).
const all4ShadedMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allShaded = next.every(v => v === SHADE);
    return allShaded ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const no2x2Shaded = label.makeReplicate(
  new NFA(all4ShadedMachine, 'no-2x2-fully-shaded',
    ...label.at(graph.block(gridCells[0], 2, 2))),
  label.at(blockOrigins));

// Per cage: digits at cells carrying this cage's label (scanned across its
// zone as alternating (label, digit) pairs) must be all different and sum to
// the corner total. The mask tracks which digits have been seen; a repeat
// rejects immediately, so its popcount is exactly the number of cage cells
// read -- no separate size bookkeeping is needed here (size is pinned below).
const cageSumChecks = cageInfo.map(c => {
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inRegion: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inRegion: value === c.label };
      }
      if (!state.inRegion) return { mask: state.mask, reading: false, inRegion: false };
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // digits do not repeat
      return { mask: state.mask | bit, reading: false, inRegion: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      let sum = 0;
      for (const d of DIGITS) if (state.mask & (1 << (d - 1))) sum += d;
      return sum === c.total;
    },
  }, geometry);
  return new NFA(machine, `cage-${c.label}-sum`,
    ...c.zone.flatMap(cell => [label.at(cell), cell]));
});

// Per cage: the clue cell's own digit equals the region's cell count. Each
// feasible size gets its own branch pinning the clue digit to that size and
// requiring the label to occur exactly that many times within the cage's own
// zone (the only cells its label domain admits) -- exactly one branch holds
// in any solution. Paired with cageConnectivity above, this makes the
// labelled set a connected region of exactly the clue's own digit in size.
const cageSizeBranches = cageInfo.map(c => new Or(c.sizes.map(n => new And([
  new Given(c.cell, n),
  new ContainExact(Array(n).fill(c.label).join('_'), ...label.at(c.zone)),
]))));

return [
  shape,
  label.toVar('label'),
  new Given('R9C9', 1, 3, 5, 7, 9), // grey circle: odd digit
  digitDomain,
  ...labelDomain,
  ...boundaryAgreement,
  shadeConnectivity,
  ...cageConnectivity,
  no2x2Shaded,
  ...cageSumChecks,
  ...cageSizeBranches,
];
