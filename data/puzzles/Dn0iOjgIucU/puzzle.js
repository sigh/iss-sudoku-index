// Title: Fillomino-ish Killer Sudoku
// Author: SirWoezel
// Video: https://www.youtube.com/watch?v=Dn0iOjgIucU
// Source: https://app.crackingthecryptic.com/webapp/bPgHhFJdm4

// Rules encoded here, in full:
//  - Normal sudoku: 1-9 once per row, column and 3x3 box.
//  - The grid is entirely covered by cages of orthogonally-connected cells,
//    each at least 2 cells, no two cages overlapping.
//  - Killer: digits do not repeat inside a cage.
//  - A cage's total, when printed, is shown in the cage's own leftmost cell
//    of its highest row, and the cage's digits sum to it. A cage with no
//    printed total ("??" in the source) has no sum constraint.
//  - Every cage holds exactly one circled cell, and the circled digit equals
//    that cage's cell count (so every cage has between 2 and 9 cells).
//  - Two different cages of equal size may not share a row or a column.
//
// The cage partition itself is not drawn: the source only marks each cage's
// total cell and the 15 circles. Both are anchors -- one cage per printed
// total-cell and, since there are exactly 15 circles for 15 cages, one cage
// per circle -- so the partition is bounded (every cage size is a sudoku
// digit >= 2, i.e. 2-9) and anchored (every cage owns one drawn total-cell),
// which is what makes an unknown-partition encoding apply here: a label
// overlay per cage, `ConnectedValues` for connectivity, and `ValueIndexing`
// to read a cage's declared size back through its label. Nothing is omitted.

// The 15 cage markers: [cell, printed total or null for "??"], in the
// leftmost-topmost cell of each cage, from the source's `cages` array. Label
// k (1-based, this array order) is pinned to marker k.
const MARKERS = [
  ['R1C1', null], ['R2C2', null], ['R5C1', null], ['R2C1', 41],
  ['R1C4', null], ['R1C5', null], ['R2C6', 11], ['R6C2', 21],
  ['R7C4', null], ['R7C6', 19], ['R7C8', null], ['R5C9', 44],
  ['R2C9', null], ['R5C5', 36], ['R5C6', null],
];
const NUM_LABELS = MARKERS.length; // 15
const markerCells = MARKERS.map(([cell]) => cell);

// Widen the shape so the 1-15 cage-label alphabet fits; the main grid cells
// are restricted straight back to 1-9 below.
const shape = new Shape('9x9', NUM_LABELS);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numValues = geometry.numValues; // 15: 9 digits + 15 cage labels share one alphabet

// The 15 drawn circles, from the source's `underlays` array.
const CIRCLES = [
  'R2C2', 'R2C6', 'R3C3', 'R3C4', 'R4C2', 'R6C2', 'R7C3', 'R8C4',
  'R7C6', 'R7C7', 'R8C8', 'R6C8', 'R4C8', 'R3C7', 'R5C5',
];

// --- Overlays ------------------------------------------------------------
// VR: this cell's cage label (1..15), one per grid cell.
// VZ: the declared size (2-9) of the cage anchored at each marker, one per
//     marker.
// VW: this cell's own cage's size (2-9), dereferenced from VZ through VR --
//     lets the row/column exclusion rule compare two arbitrary cells' cage
//     sizes without knowing their labels in advance.
const region = graph.makeOverlay('VR');
const size = graph.makeOverlay('VZ', markerCells);
const cellSize = graph.makeOverlay('VW');

const gridCells = graph.cells();
const restrictDigits = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const restrictSize = size.makeReplicate(
  new Given(size.cells()[0], 2, 3, 4, 5, 6, 7, 8, 9));
const restrictCellSize = cellSize.makeReplicate(
  new Given(cellSize.cells()[0], 2, 3, 4, 5, 6, 7, 8, 9));

// Pin marker k's label to k: this is what breaks the label-permutation
// symmetry (each label is tied to its own drawn total-cell) and gives every
// cage a fixed identity to hang its size and total on.
const markerLabels = MARKERS.map(
  ([cell], i) => new Given(region.at(cell), i + 1));

// Every cage is orthogonally connected (the label class is non-empty because
// its marker is pinned into it).
const connectivity = Array.from(
  { length: NUM_LABELS }, (_, i) => new ConnectedValues('VR', i + 1));

// A cage's true cell count must match its declared size. ConnectedValues may
// not sit inside Or/And, so the size is asserted unconditionally above and
// checked here per candidate value with ContainExact, which may.
const sizeChecks = MARKERS.map(([cell], i) => new Or(
  [2, 3, 4, 5, 6, 7, 8, 9].map(s => new And([
    new Given(size.at(cell), s),
    new ContainExact(Array(s).fill(i + 1).join('_'), ...region.cells()),
  ]))
));

// Exactly one circle per cage: 15 circles, 15 labels, so pairwise-distinct
// circle labels is a bijection between them.
const oneCirclePerCage = new AllDifferent(...region.at(CIRCLES));

// A circled digit is its own cage's declared size, read through the label.
const circleIsSize = CIRCLES.map(
  cell => new ValueIndexing(cell, region.at(cell), ...size.cells()));

// Every cell's own cage size, dereferenced the same way.
const cellSizeLookup = gridCells.map(
  cell => new ValueIndexing(cellSize.at(cell), region.at(cell), ...size.cells()));

// --- Generic "same first pair -> different second pair" machine ----------
// Read as [x1, x2, y1, y2]: if x1 === x2, then y1 must differ from y2.
// Used both for "different cages may not share a printed digit here" (x =
// label, y = digit) and "same-size cages may not share this row/column"
// (x = label, y = size) -- same shape, different meaning per use.
const sameFirstDiffersSecondNFA = NFA.encodeSpec({
  startState: { phase: 'x1' },
  transition: (state, value) => {
    if (state.phase === 'x1') return { phase: 'x2', x: value };
    if (state.phase === 'x2') return { phase: 'y1', same: state.x === value };
    if (state.phase === 'y1') return { phase: 'y2', same: state.same, y: value };
    return !state.same || state.y !== value ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

// Killer: digits do not repeat inside a cage. Row/column/box all-different
// already forces this for any pair sharing a row, column or box; only the
// remaining pairs need the explicit label-vs-digit check.
const parse = (cell) => {
  const { row, col } = parseCellId(cell);
  return { row, col, box: (Math.ceil(row / 3) - 1) * 3 + Math.ceil(col / 3) };
};
const cellInfo = new Map(gridCells.map(c => [c, parse(c)]));
const cageDistinctPairs = [];
for (let i = 0; i < gridCells.length; i++) {
  for (let j = i + 1; j < gridCells.length; j++) {
    const a = cellInfo.get(gridCells[i]);
    const b = cellInfo.get(gridCells[j]);
    if (a.row === b.row || a.col === b.col || a.box === b.box) continue;
    cageDistinctPairs.push([gridCells[i], gridCells[j]]);
  }
}
const cageDistinct = cageDistinctPairs.map(([a, b]) => new NFA(
  sameFirstDiffersSecondNFA, 'cage-distinct',
  region.at(a), region.at(b), a, b));

// Two different cages of equal size may not share a row or a column.
const rowColPairs = [...graph.rows(), ...graph.columns()].flatMap(
  unit => unit.flatMap((a, i) => unit.slice(i + 1).map(b => [a, b])));
const sizeExclusion = rowColPairs.map(([a, b]) => new NFA(
  sameFirstDiffersSecondNFA, 'size-exclusion',
  region.at(a), region.at(b), cellSize.at(a), cellSize.at(b)));

// --- Cage totals -----------------------------------------------------------
// For each marker with a printed total, sum the digits of every cell whose
// label matches that marker's, across the whole grid.
const cageSumNFA = (label, target) => NFA.encodeSpec({
  startState: { phase: 'd', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'd') return { phase: 'l', sum: state.sum, d: value };
    const sum = state.sum + (value === label ? state.d : 0);
    if (sum > 45) return undefined;
    return { phase: 'd', sum };
  },
  accept: (state) => state.phase === 'd' && state.sum === target,
}, numValues);

const cageTotals = MARKERS.flatMap(([, total], i) => {
  if (total === null) return [];
  return [new NFA(
    cageSumNFA(i + 1, total), 'cage-total',
    ...gridCells.flatMap(cell => [cell, region.at(cell)]))];
});

return [
  shape,
  new Given('R5C2', 1),

  region.toVar('CageLabel'),
  size.toVar('CageSize'),
  cellSize.toVar('CellCageSize'),
  restrictDigits,
  restrictSize,
  restrictCellSize,

  ...markerLabels,
  ...connectivity,
  ...sizeChecks,
  oneCirclePerCage,
  ...circleIsSize,
  ...cellSizeLookup,
  ...cageDistinct,
  ...sizeExclusion,
  ...cageTotals,
];
