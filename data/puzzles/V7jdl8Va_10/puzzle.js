// Title: Chaos Deconstruction
// Author: MantaRay
// Video: https://www.youtube.com/watch?v=V7jdl8Va_10
// Source: https://sudokupad.app/qdelvmtzxm

// Rules encoded here:
//   CHAOS DECONSTRUCTION  nine regions of 9 orthogonally connected cells, no two
//                         regions touching even diagonally; each region holds the
//                         digits 1-9; digits do not repeat in a row or column.
//   VALUES                a cell outside every region has value 0; every other
//                         cell's value is its digit. All the clues below read
//                         values, so a 0 cell takes part in them.
//   ODD/EVEN              grey circle = odd value, grey square = even value
//                         (0 is even, so a grey square may sit outside a region).
//   KROPKI                white dot = consecutive values, black dot = one value
//                         is double the other. No negative constraint is stated,
//                         so unmarked pairs are unconstrained.
//   DIAGONAL              on each main diagonal no value other than 0 repeats.
// Nothing is omitted.
//
// Rows/columns repeat digits, so the grid is Raw: no implicit constraints.
// VD (the value 0-9 of each cell) is the main grid; VR (the region label of
// each cell) remains a second 11x11 Var overlay from the same cellGraph.

const SIZE = 11;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const REGION_COUNT = 9;

const shape = new Shape('11x11', '0-9', 'Raw');
const graph = cellGraph(shape);
const regions = graph.makeOverlay('VR');
const regionVars = regions.toVar('Regions');

// Nine regions of nine cells leave 121 - 81 = 40 cells outside every region.
// The same multiset serves both layers: labels 1-9 nine times each for VR, and
// (because each region holds 1-9 once) digits 1-9 nine times each for VD.
const exactMultiset = [
  ...Array(SIZE * SIZE - REGION_COUNT * 9).fill(0),
  ...DIGITS.flatMap(digit => Array(REGION_COUNT).fill(digit)),
].join('_');

// A cell is outside every region exactly when its value is 0.
const outsideKey = Pair.fnToKey((label, value) => (label === 0) === (value === 0), shape);
const outsideLink = graph.cells().map(cell => new Pair(
  outsideKey, 'value 0 outside regions', regions.at(cell), cell));

// No two regions touch, even diagonally: two king-adjacent cells that are both
// in a region are in the same region.
const noTouchKey = Pair.fnToKey(
  (a, b) => a === 0 || b === 0 || a === b, shape);
// The four king-move directions that cover every unordered adjacent pair, each
// given as the two cell offsets of its template relative to the replicated
// origin (the down-left template is anchored one column right so that both of
// its cells stay on the grid).
const NO_TOUCH_TEMPLATES = [
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [1, 1]],
  [[0, 1], [1, 0]],
];
const noTouch = NO_TOUCH_TEMPLATES.map(offsets => {
  const template = new Pair(
    noTouchKey, 'regions do not touch',
    ...offsets.map(([dr, dc]) => regionVars.cell(1 + dr, 1 + dc)));
  const targets = [];
  for (let row = 1; row <= SIZE; row++) {
    for (let col = 1; col <= SIZE; col++) {
      const fits = offsets.every(([dr, dc]) =>
        row + dr <= SIZE && col + dc >= 1 && col + dc <= SIZE);
      if (fits) targets.push(regionVars.cell(row, col));
    }
  }
  return regions.makeReplicate(template, targets);
});

// Each label's cells form one orthogonally connected region. With the exact
// multiset above that makes each region nine orthogonally connected cells.
const connected = DIGITS.map(label => new ConnectedValues('VR', label));

// Which region carries which label is free, and letting the solver choose costs
// a factor of 9!. Fix a labelling convention instead: reading the cells in
// row-major order, label k first appears before label k+1. The state is the
// largest label seen so far.
const canonicalSpec = NFA.encodeSpec({
  startState: 0,
  transition: (maxSeen, value) => {
    if (value === 0) return maxSeen;
    if (value > maxSeen + 1 || value > REGION_COUNT) return undefined;
    return value > maxSeen ? value : maxSeen;
  },
  accept: (maxSeen) => maxSeen === REGION_COUNT,
}, shape);
const canonicalLabels = new NFA(
  canonicalSpec, 'canonical region labels', ...regions.cells());

// "Digits may not repeat within a region": two cells with the same label hold
// different values. A region is nine orthogonally connected cells, so its two
// furthest cells are eight orthogonal steps apart; pairs further than Manhattan
// distance 8 can never share a label and need no constraint, and pairs sharing a
// row or column are already covered above.
// Each machine reads four cells in the order VR(a), VR(b), VD(a), VD(b): once
// the two labels differ it moves to the 'ok' sink, otherwise it remembers the
// first value and rejects a repeat of it.
const samePairSpec = NFA.encodeSpec({
  startState: 'start',
  transition: (state, value) => {
    if (state === 'ok') return 'ok';
    if (state === 'start') return { label: value };
    if (state.label !== undefined) {
      return state.label === value ? 'same' : 'ok';
    }
    if (state === 'same') return { value };
    return state.value === value && value !== 0 ? undefined : 'ok';
  },
  accept: (state) => state === 'ok' || state.value !== undefined,
}, shape);
const regionDigits = [];
for (let row = 1; row <= SIZE; row++) {
  for (let col = 1; col <= SIZE; col++) {
    for (let dr = 0; dr <= 7; dr++) {
      for (let dc = -7; dc <= 7; dc++) {
        if (dr === 0 || dc === 0 || dr + Math.abs(dc) > 8) continue;
        const [r2, c2] = [row + dr, col + dc];
        if (r2 > SIZE || c2 < 1 || c2 > SIZE) continue;
        regionDigits.push(new NFA(
          samePairSpec, 'region digits differ',
          regionVars.cell(row, col), regionVars.cell(r2, c2),
          makeCellId(row, col), makeCellId(r2, c2)));
      }
    }
  }
}

// Digits do not repeat in a row or column, and no value other than 0 repeats on
// either main diagonal. 0s are unrestricted in all three.
const nonzeroDifferentKey = PairX.fnToKey(
  (a, b) => a === 0 || b === 0 || a !== b, shape);
const rowsAndColumns = [];
const diagonals = [[], []];
for (let n = 1; n <= SIZE; n++) {
  rowsAndColumns.push(graph.row(n), graph.column(n));
  diagonals[0].push(makeCellId(n, n));
  diagonals[1].push(makeCellId(n, SIZE + 1 - n));
}
const noRepeats = [...rowsAndColumns, ...diagonals].map(cells => new PairX(
  nonzeroDifferentKey, 'nonzero values differ', ...cells));

// Drawn clues, as [row, column]. The nine grey circles, then the six grey
// squares.
const cellAt = ([row, col]) => makeCellId(row, col);
const ODD_CELLS = [
  [3, 3], [3, 6], [3, 9], [6, 3], [6, 6], [6, 9], [9, 3], [9, 6], [9, 9],
];
const EVEN_CELLS = [[2, 4], [4, 1], [4, 7], [6, 5], [8, 4], [11, 8]];
const parity = [
  ...ODD_CELLS.map(cell => new Given(cellAt(cell), 1, 3, 5, 7, 9)),
  ...EVEN_CELLS.map(cell => new Given(cellAt(cell), 0, 2, 4, 6, 8)),
];

// Kropki dots, as drawn: the five white dots, then the nine black dots.
const WHITE_DOTS = [
  [[3, 5], [3, 6]], [[3, 6], [3, 7]], [[3, 10], [4, 10]],
  [[9, 1], [10, 1]], [[11, 9], [11, 10]],
];
const BLACK_DOTS = [
  [[1, 5], [1, 6]], [[1, 6], [1, 7]], [[2, 1], [2, 2]], [[3, 4], [4, 4]],
  [[5, 8], [6, 8]], [[8, 9], [8, 10]], [[9, 4], [10, 4]],
  [[11, 5], [11, 6]], [[11, 6], [11, 7]],
];
// Both dot rules are stated over values, so 0 participates: 0 is consecutive
// with 1, and 0 is double 0. Every dot here joins orthogonally adjacent
// cells, so the native classes apply directly.
const dots = [
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(cellAt(a), cellAt(b))),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(cellAt(a), cellAt(b))),
];

return [
  shape,
  regionVars,
  new ContainExact(exactMultiset, ...regions.cells()),
  new ContainExact(exactMultiset, ...graph.cells()),
  ...outsideLink,
  ...noTouch,
  ...connected,
  canonicalLabels,
  ...regionDigits,
  ...noRepeats,
  ...parity,
  ...dots,
];
