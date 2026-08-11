// Title: Smorg
// Author: Jakhob and wooferzfg
// Video: https://www.youtube.com/watch?v=WDWRT9W1cXc
// Source: https://app.crackingthecryptic.com/sudoku/LjtD6LjLRF
//
// Rules: fill some cells with digits 1-9, no digit repeats in a row or
// column, and some cells are left empty; all empty cells are orthogonally
// connected; every digit belongs to a region, an orthogonally connected
// 9-cell group with no repeated digit; regions may not touch each other
// orthogonally; an outside clue sums the digits from its side up to (not
// including) the first empty cell; a circled cell must hold a digit equal
// to how many of its up-to-8 neighbours are empty; not all possible circles
// are given (so absence of a circle implies nothing).
//
// The region rule (discover N orthogonally-connected 9-cell regions,
// no-repeat within a region, regions don't touch) is NOT encoded: it is a
// solver-deduced partial-coverage jigsaw -- 100 grid cells with 9-cell
// regions plus solver-placed excluded (empty) cells -- and no ISS
// primitive covers that. ChaosConstruction is the only discovered-region
// class and it requires one region cell for every grid cell and grid-cell-
// count divisible by region size (100 % 9 != 0 here), so it cannot leave
// any cells unassigned. There is also no composable way to build "digits
// in cells sharing an unknown region label are all-different" by hand.
//
// What remains is encoded faithfully, entirely from the row/column and
// empty-cell layer (none of it needs the region rule):
//
// Grid modelled as Shape('10x10', '0-9', 'Raw'): 0 stands for "empty", 1-9
// for a placed digit. Raw (no implicit row/column groups) because the rule
// only forbids repeated digits -- it does not require every row/column to
// use all 9 digits -- so plain AllDifferent over the widened range would
// wrongly force exactly one empty cell per row/column. Instead each
// row/column gets a custom NFA: track a 9-bit "seen digit" mask, reject on
// a repeated nonzero value, let 0 pass through freely.

const SHAPE = new Shape('10x10', '0-9', 'Raw');
const N = 10;
const graph = cellGraph(SHAPE);

const cell = (r, c) => makeCellId(r, c);

const rowCells = (r, fromLeft) => {
  const cols = [];
  for (let c = 1; c <= N; c++) cols.push(c);
  if (!fromLeft) cols.reverse();
  return cols.map(c => cell(r, c));
};
const colCells = (c, fromTop) => {
  const rows = [];
  for (let r = 1; r <= N; r++) rows.push(r);
  if (!fromTop) rows.reverse();
  return rows.map(r => cell(r, c));
};

// No-repeat-except-0 NFA, shared (same rule) across every row and column.
const noRepeatSpec = {
  startState: 0,
  transition: (mask, value) => {
    if (value === 0) return mask;
    const bit = 1 << (value - 1);
    if (mask & bit) return undefined;
    return mask | bit;
  },
  accept: () => true,
};
const noRepeatEncoded = NFA.encodeSpec(noRepeatSpec, SHAPE);
const rowNoRepeat = [];
const colNoRepeat = [];
for (let r = 1; r <= N; r++) {
  rowNoRepeat.push(new NFA(noRepeatEncoded, `row ${r} no repeat`, ...rowCells(r, true)));
}
for (let c = 1; c <= N; c++) {
  colNoRepeat.push(new NFA(noRepeatEncoded, `col ${c} no repeat`, ...colCells(c, true)));
}

// Givens.
const givens = [
  new Given(cell(1, 7), 6),
  new Given(cell(6, 6), 2),
];

// All empty (0) cells form a single orthogonally-connected region.
const emptyConnectivity = new ConnectedValues('', 0);

// Outside sum clues: sum digits from the clue's side until the first empty
// (0) cell, not including it. Cell order/side/target read from the drawn
// outside-clue text overlays (left/right/top/bottom badges).
const OUTSIDE_CLUES = [
  [rowCells(1, true), 18],    // left of R1
  [rowCells(4, true), 15],    // left of R4
  [rowCells(8, true), 8],     // left of R8
  [rowCells(10, true), 13],   // left of R10
  [rowCells(1, false), 8],    // right of R1
  [colCells(3, true), 10],    // top of C3
  [colCells(5, true), 8],     // top of C5
  [colCells(6, true), 17],    // top of C6
  [colCells(10, true), 8],    // top of C10
  [colCells(5, false), 5],    // bottom of C5
  [colCells(6, false), 8],    // bottom of C6
  [colCells(8, false), 14],   // bottom of C8
  [colCells(10, false), 20],  // bottom of C10
];

// One NFA per clue: running sum of digits seen so far (a branch that has
// already overshot the target dies immediately, so the sum state stays
// bounded by the target); require the sum to equal the target exactly when
// the empty (0) cell is read, then ignore every cell after it -- this stops
// at the FIRST 0 regardless of how many further empty cells follow, since
// once `stopped` is true later symbols are ignored.
const outsideClueNFAs = OUTSIDE_CLUES.map(([cells, target]) => {
  const spec = {
    startState: { sum: 0, stopped: false },
    transition: (state, value) => {
      if (state.stopped) return state;
      if (value === 0) {
        return state.sum === target ? { sum: state.sum, stopped: true } : undefined;
      }
      const sum = state.sum + value;
      return sum <= target ? { sum, stopped: false } : undefined;
    },
    accept: (state) => state.stopped,
  };
  const encoded = NFA.encodeSpec(spec, SHAPE);
  return new NFA(encoded, `outside sum ${target}`, ...cells);
});

// Circled cells: must hold a digit (not 0), and that digit equals the count
// of empty (0) cells among its up-to-8 orthogonal/diagonal neighbours.
// Cell list from the drawn (rounded, border-only, blank-text) circle
// overlays.
const CIRCLE_CELLS = [
  [2, 1], [2, 2], [2, 6], [2, 9], [3, 9],
  [5, 8], [6, 2], [8, 4], [9, 7], [9, 10],
];

// One NFA per circle: the first cell read (the circle itself) sets the
// target; each king-move neighbour after it (graph.kingNeighbours already
// drops off-grid cells, so edge/corner circles get their true 5-neighbour
// set) adds 1 to the count when it is empty (0); accept requires the
// target to be a real digit (>=1, i.e. "must contain a digit") and the
// final count to equal it exactly.
const circleNFAs = CIRCLE_CELLS.map(([r, c]) => {
  const spec = {
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      const hit = value === 0 ? 1 : 0;
      return { target, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ target, count }) => target !== null && target !== 0 && count === target,
  };
  const encoded = NFA.encodeSpec(spec, SHAPE);
  const origin = cell(r, c);
  return new NFA(encoded, `circle count R${r}C${c}`, origin, ...graph.kingNeighbours(origin));
});

return [
  SHAPE,
  ...givens,
  ...rowNoRepeat,
  ...colNoRepeat,
  emptyConnectivity,
  ...outsideClueNFAs,
  ...circleNFAs,
];
