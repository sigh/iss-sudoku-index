// Title: Stostone cold
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=VDdKZ-PYKws
// Source: https://sudokupad.app/a21fmb469t

// Rules encoded, in full:
//  1. Fill the cells with the digits 1 to 8 such that each digit appears
//     exactly once in every row, column and region.
//  2. A region is a collection of eight orthogonally connected cells;
//     determining the shapes is part of the puzzle.
//  3. Each region has exactly one clue, a small number in the upper left
//     corner of some cell in that region.
//  4. Shade some cells such that (a) no orthogonally neighbouring cells are
//     shaded across a region boundary, (b) all shaded cells within a region
//     are orthogonally connected, (c) the digits in all shaded cells within a
//     region sum to the region's clue.
//  5. If all of the shaded groups fell straight down without changing shape,
//     they would completely fill the bottom half of the grid.
// Nothing is omitted.

// The eight clues, transcribed from the small numbers drawn in a cell's upper
// left corner (text overlays at board coordinates (row + 0.36, col + 0.25)).
const CLUES = [
  { cell: 'R1C1', total: 13 },
  { cell: 'R2C1', total: 36 },
  { cell: 'R2C2', total: 33 },
  { cell: 'R3C6', total: 21 },
  { cell: 'R5C1', total: 9 },
  { cell: 'R6C7', total: 15 },
  { cell: 'R8C2', total: 7 },
  { cell: 'R8C4', total: 22 },
];
const CLUE_TOTAL = CLUES.reduce((sum, clue) => sum + clue.total, 0);

const GIVENS = [['R3C5', 3], ['R6C3', 1], ['R7C1', 4]];

const HALF = 4;      // the bottom half is rows 5-8
const UNSHADED = 9;  // sentinel value, see below

// The value range is widened to 1-9 to give the overlays one spare state: the
// landing overlay uses 9 for "unshaded", and each masked-digit overlay stores
// digit + 1 so that a masked-out cell can hold 1. Chaos regions still hold
// eight cells, because region size follows the grid, not the value count; the
// grid cells are restricted back to 1-8 below.
const shape = new Shape('8x8', 9);
const graph = cellGraph(shape);
const cells = graph.cells();

const cc = graph.makeOverlay('CC');   // region label, 1-8
const vt = graph.makeOverlay('VT');   // 9, or the row this cell falls to

// One masked-digit overlay per region label: VA is label 1 ... VH is label 8.
const MASK_PREFIXES = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH'];
const masks = MASK_PREFIXES.map(prefix => graph.makeOverlay(prefix));

// Which clue belongs to which region label: cell (label, clue index) holds 2
// when that clue's cell carries that label, and 1 otherwise.
const incidence = new Var('I', 'clue-region incidence', '8x8');
const incidenceCells = graph.makeOverlay('VI');

const digitRange = graph.makeReplicate(
  new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8));

const givens = GIVENS.map(([cell, value]) => new Given(cell, value));

// Rule 3: eight clues in eight distinct regions, so every region has one.
const oneCluePerRegion = new AllDifferent(...cc.at(CLUES.map(c => c.cell)));

// -- Rule 5 ------------------------------------------------------------------

// The shaded groups fall as rigid pieces and come to rest exactly filling rows
// 5-8. That final packing is reached if and only if each shaded cell can be
// assigned a landing row so that: every group keeps its shape (one shared drop
// per group), no piece passes through another (within a column the landing
// order matches the starting order), and the landings cover rows 5-8 exactly.
// Given such an assignment the bottom half is full, so nothing can fall any
// further and it is the resting position; conversely the real fall supplies
// one. So VT records the landing row, and the four constraint groups below are
// the three conditions.
const fallRange = cells.map(cell => {
  const { row } = parseCellId(cell);
  const landings = [];
  for (let r = Math.max(HALF + 1, row); r <= 2 * HALF; r++) landings.push(r);
  return new Given(vt.at(cell), UNSHADED, ...landings);
});

const columnFill = graph.columns().map(column => new ContainExact(
  [UNSHADED, UNSHADED, UNSHADED, UNSHADED, 5, 6, 7, 8].join('_'),
  ...vt.at(column)));

// Pair predicates over two landing values; 9 on either side means at least one
// of the pair is unshaded, which leaves the pair unconstrained.
const sameLandingKey = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || a === b, shape);
const nextLandingKey = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || b === a + 1, shape);
const belowKey = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || a < b, shape);

// Stamps one landing relation onto every pair of cells a fixed step apart.
const landingPairs = (key, name, rowStep, colStep) => {
  const inGrid = cell => graph.step(cell, rowStep, colStep) !== null;
  const template = new Pair(key, name,
    vt.at(cells[0]), vt.at(graph.step(cells[0], rowStep, colStep)));
  return vt.makeReplicate(template, vt.at(cells.filter(inGrid)));
};

// Rule 4a puts every orthogonally adjacent shaded pair in one group, so the
// shared drop applies to all of them: side by side they land in the same row,
// one above the other in consecutive rows.
const rigidRows = landingPairs(sameLandingKey, 'same landing row', 0, 1);
const rigidColumns = landingPairs(nextLandingKey, 'next landing row', 1, 0);
const landingOrder = [2, 3, 4, 5, 6, 7].map(
  gap => landingPairs(belowKey, 'lands below', gap, 0));

// -- Rule 4a -----------------------------------------------------------------

// Reads [label(a), label(b), landing(a), landing(b)] for one orthogonally
// adjacent pair. `pending` means "the labels differ and a is shaded", which is
// the only state from which the last cell can fail.
const borderShadeNFA = NFA.encodeSpec({
  startState: { step: 0 },
  transition(state, value) {
    switch (state.step) {
      case 0: return { step: 1, label: value };
      case 1: return { step: 2, sameRegion: value === state.label };
      case 2: return { step: 3, pending: !state.sameRegion && value !== UNSHADED };
      case 3: return (state.pending && value !== UNSHADED) ? undefined : { step: 4 };
      default: return undefined;
    }
  },
  accept: state => state.step === 4,
  maxDepth: 4,
}, shape);

const borderShading = cells.flatMap((cell, index) =>
  graph.neighbours(cell)
    .filter(other => cells.indexOf(other) > index)
    .map(other => new NFA(borderShadeNFA, 'no shading across a border',
      cc.at(cell), cc.at(other), vt.at(cell), vt.at(other))));

// -- Rules 4b and 4c ---------------------------------------------------------

// The overlay for label L holds digit + 1 (so 2-9) on the cells of region L
// that are shaded, and 1 on every other cell. Its non-1 cells are therefore
// exactly region L's shaded cells, and its 64 cells total (region L's clue) +
// 64: each shaded cell of the region contributes its digit plus one, each of
// the remaining cells contributes one, and the shaded count cancels.
// Reads [label, landing, digit, masked digit] for one cell.
const maskNFAs = MASK_PREFIXES.map((_, index) => NFA.encodeSpec({
  startState: { step: 0 },
  transition(state, value) {
    switch (state.step) {
      case 0: return { step: 1, inRegion: value === index + 1 };
      case 1: return { step: 2, masked: state.inRegion && value !== UNSHADED };
      case 2: return { step: 3, expect: state.masked ? value + 1 : 1 };
      case 3: return value === state.expect ? { step: 4 } : undefined;
      default: return undefined;
    }
  },
  accept: state => state.step === 4,
  maxDepth: 4,
}, shape));

const maskDefinitions = masks.flatMap((mask, index) =>
  cells.map(cell => new NFA(maskNFAs[index], `region ${index + 1} masked digits`,
    cc.at(cell), vt.at(cell), cell, mask.at(cell))));

const shadedConnected = MASK_PREFIXES.map(prefix =>
  new ConnectedValues(prefix, [2, 3, 4, 5, 6, 7, 8, 9].join('_')));

const incidenceRange = incidenceCells.makeReplicate(
  new Given(incidenceCells.at(cells[0]), 1, 2));

// Flag (L, k) is set exactly when clue k's cell carries label L.
const incidenceKeys = masks.map((_, l) =>
  Pair.fnToKey((flag, label) => (flag === 2) === (label === l + 1), shape));

const incidenceLinks = CLUES.flatMap((clue, k) =>
  masks.map((_, l) => new Pair(incidenceKeys[l], 'clue lies in this region',
    incidence.cell(l + 1, k + 1), cc.at(clue.cell))));

// Rule 4c. Region L's clue is the one clue whose flag is set, so
//   sum(clue k * flag(L, k)) - sum(overlay L) = CLUE_TOTAL - 64,
// where the selected clue enters the first term once above the CLUE_TOTAL
// baseline and leaves the second term as the +64 offset.
const regionTotals = masks.map((mask, l) => new Sum(
  CLUE_TOTAL - cells.length,
  ...CLUES.map((clue, k) => [incidence.cell(l + 1, k + 1), clue.total]),
  ...cells.map(cell => [mask.at(cell), -1])));

return [
  shape,
  new NoBoxes(),
  new ChaosConstruction(),
  vt.toVar('falls to row'),
  ...masks.map((mask, l) => mask.toVar(`region ${l + 1} masked digits`)),
  incidence,
  digitRange,
  ...givens,
  oneCluePerRegion,
  ...fallRange,
  ...columnFill,
  rigidRows,
  rigidColumns,
  ...landingOrder,
  ...borderShading,
  ...maskDefinitions,
  ...shadedConnected,
  incidenceRange,
  ...incidenceLinks,
  ...regionTotals,
];
