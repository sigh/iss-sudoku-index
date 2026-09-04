// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=cD2Mmj5115A
// Source: https://cracking-the-cryptic.web.app/sudoku/P4MHpTGmRn

// Lookouts: divide the 5x5 grid into regions whose sizes are given by the
// circles outside the grid (five circled 5s, one per column: 5 regions of 5
// cells, 5x5 = 25). Each grid number is how many cells can be "seen"
// horizontally and vertically from that cell before hitting the edge of its
// own region (including the cell itself). A cell is printed iff its count is
// the maximum reached anywhere in its own region. No Sudoku layer: rows,
// columns and boxes carry no all-different rule, so the grid is Raw. Region
// shapes are not drawn; the solver must discover a partition into five
// connected 5-cell regions consistent with which of the 25 cells are printed.

const shape = new Shape('5x5', '1-5', 'Raw');
const graph = cellGraph('5x5');
const gridCells = graph.cells();

// Region-label overlay: one Var per cell, holding which of the 5 regions it
// belongs to. Values share the grid's 1-5 range only because both happen to
// be 5 here; the label numbers themselves carry no puzzle meaning.
const region = graph.makeOverlay('VR');

// Givens -- as drawn on the board.
const GIVENS = {
  R1C1: 4, R1C2: 4, R1C5: 5,
  R2C4: 4,
  R3C1: 5,
  R4C4: 4,
  R5C2: 5,
};
const givenCells = new Set(Object.keys(GIVENS));
const givens = Object.entries(GIVENS).map(([cell, v]) => new Given(cell, v));

// --- Partition: five regions, each a connected area of exactly 5 cells.
// Interchangeable region labels would multiply solutions by 5!; break the
// symmetry with a canonical order instead (region k's first row-major
// appearance must precede region k+1's).
const regionSizes = [1, 2, 3, 4, 5].map(k => new ConnectedValues('VR', k, 5));

const canonicalOrderSpec = NFA.encodeSpec({
  startState: { maxSeen: 0 },
  // A label can only introduce a new region one higher than the highest
  // confirmed so far, which forces first-appearance order 1, 2, 3, 4, 5.
  transition: ({ maxSeen }, value) =>
    (value > maxSeen + 1) ? undefined : { maxSeen: Math.max(maxSeen, value) },
  accept: ({ maxSeen }) => maxSeen === 5,
}, 5);
const canonicalOrder =
  new NFA(canonicalOrderSpec, 'canonical-region-order', region.cells());

// --- Sightline counts. One NFA per cell: read its own digit and label, then
// each of the four rays' labels out to the grid edge (nearest cell first).
// A ray's running count freezes ("blocked") the first time a ray cell's label
// differs from the origin's own label, matching "before hitting the edges of
// that region". `targetCount` is digit-1, since the four rays' frozen counts
// must sum to (digit - 1): the digit already counts the origin cell itself.
const sightlineSpec = NFA.encodeSpec({
  startState: {
    phase: 0, targetLabel: null, targetCount: 0, total: 0, blocked: false,
  },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) return { ...state, blocked: false };
    if (state.phase === 0) return { ...state, phase: 1, targetCount: value - 1 };
    if (state.phase === 1) return { ...state, phase: 2, targetLabel: value };
    if (state.blocked) return state;
    if (value === state.targetLabel) {
      return { ...state, total: Math.min(state.total + 1, state.targetCount + 1) };
    }
    return { ...state, blocked: true };
  },
  accept: (state) => state.phase === 2 && state.total === state.targetCount,
}, 5, { multiSegment: true });

const sightlines = gridCells.map(cell => {
  const label = region.at(cell);
  const rayLabels = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dr, dc]) => region.ray(label, dr, dc).slice(1));
  return new NFA(sightlineSpec, 'sightline', [cell, label], ...rayLabels);
});

// --- Given iff maximum in its region. Both directions read the whole grid's
// interleaved [label, digit, label, digit, ...] against the clued cell's own
// (digit, label), read first.
const interleaved = gridCells.flatMap(c => [region.at(c), c]);

// A given cell's digit must be >= every other cell sharing its region.
const givenIsMaxSpec = NFA.encodeSpec({
  startState: { phase: 0, ownDigit: null, ownLabel: null, curLabel: null },
  transition: (state, value) => {
    if (state.phase === 0) return { ...state, phase: 1, ownDigit: value };
    if (state.phase === 1) return { ...state, phase: 2, ownLabel: value };
    if (state.curLabel === null) return { ...state, curLabel: value };
    if (state.curLabel === state.ownLabel && value > state.ownDigit) return undefined;
    return { ...state, curLabel: null };
  },
  accept: (state) => state.phase === 2 && state.curLabel === null,
}, 5);

// A blank cell's digit must be beaten by at least one same-region cell, so it
// can never itself be the region's maximum.
const blankNotMaxSpec = NFA.encodeSpec({
  startState: {
    phase: 0, ownDigit: null, ownLabel: null, curLabel: null, found: false,
  },
  transition: (state, value) => {
    if (state.phase === 0) return { ...state, phase: 1, ownDigit: value };
    if (state.phase === 1) return { ...state, phase: 2, ownLabel: value };
    if (state.curLabel === null) return { ...state, curLabel: value };
    const hit = state.curLabel === state.ownLabel && value > state.ownDigit;
    return { ...state, curLabel: null, found: state.found || hit };
  },
  accept: (state) => state.phase === 2 && state.curLabel === null && state.found,
}, 5);

const maxRules = gridCells.map(cell => {
  const spec = givenCells.has(cell) ? givenIsMaxSpec : blankNotMaxSpec;
  const name = givenCells.has(cell) ? 'given-is-max' : 'blank-not-max';
  // One flat sequence (no SEGMENT_BREAK, so no multiSegment needed): the
  // cell's own (digit, label) followed directly by the whole grid's scan.
  return new NFA(spec, name, [cell, region.at(cell), ...interleaved]);
});

return [
  shape,
  region.toVar('region'),
  ...givens,
  ...regionSizes,
  canonicalOrder,
  ...sightlines,
  ...maxRules,
];
