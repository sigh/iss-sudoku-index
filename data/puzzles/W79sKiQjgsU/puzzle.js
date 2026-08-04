// Title: Samurai Sandwiches
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=W79sKiQjgsU
// Source: https://app.crackingthecryptic.com/sudoku/Pf67tg7FnN

// Five overlapping 6x6 grids (A top-left, B top-right, C centre, D
// bottom-left, E bottom-right); each places 1-6 once per row, column and
// region. C shares one region with each of A, B, D and E (those cells are
// literally the same board cell, obeying both grids' row/column/region
// rules); A, B, D, E never touch directly. No ISS main grid can hold this
// shape, so each 6x6 grid is its own Var group, tied together at the shared
// cells with SameValues.
//
// GRID_ORIGINS: physical (row, col), 0-indexed, of each grid's top-left cell
// on the source canvas -- e.g. A starts at physical row 2, col 1 (=R3C2).
const GRID_ORIGINS = { A: [2, 1], B: [1, 8], C: [5, 5], D: [9, 2], E: [8, 9] };

// The puzzle's 26 drawn regions verbatim: each is six [row, col] pairs
// (0-indexed), one six-cell all-different region. Four of them sit in a cell
// range shared by two grids' bounding boxes (see GRID_ORIGINS) -- those are
// C's region with each corner grid.
const REGIONS = [
  [[2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2]],
  [[2, 5], [2, 6], [3, 5], [3, 6], [4, 6], [4, 5]],
  [[1, 8], [1, 9], [1, 10], [2, 8], [2, 9], [2, 10]],
  [[1, 12], [1, 13], [2, 12], [2, 13], [1, 11], [2, 11]],
  [[5, 1], [5, 2], [6, 1], [6, 2], [7, 1], [7, 2]],
  [[5, 5], [5, 6], [6, 5], [6, 6], [7, 5], [7, 6]],
  [[5, 8], [5, 9], [5, 10], [6, 8], [6, 9], [6, 10]],
  [[5, 12], [5, 13], [6, 12], [6, 13], [5, 11], [6, 11]],
  [[9, 2], [9, 3], [10, 2], [10, 3], [10, 4], [9, 4]],
  [[9, 5], [9, 6], [9, 7], [10, 5], [10, 6], [10, 7]],
  [[8, 9], [8, 10], [9, 9], [9, 10], [10, 9], [10, 10]],
  [[8, 13], [8, 14], [9, 13], [9, 14], [10, 13], [10, 14]],
  [[13, 2], [13, 3], [14, 2], [14, 3], [13, 4], [14, 4]],
  [[13, 5], [13, 6], [13, 7], [14, 5], [14, 6], [14, 7]],
  [[12, 9], [12, 10], [13, 9], [13, 10], [11, 9], [11, 10]],
  [[12, 13], [12, 14], [13, 13], [13, 14], [11, 14], [11, 13]],
  [[11, 11], [11, 12], [12, 12], [12, 11], [13, 11], [13, 12]],
  [[8, 11], [9, 11], [10, 11], [10, 12], [9, 12], [8, 12]],
  [[3, 13], [4, 12], [4, 11], [3, 11], [3, 12], [4, 13]],
  [[3, 10], [3, 9], [3, 8], [4, 8], [4, 9], [4, 10]],
  [[2, 3], [2, 4], [3, 4], [3, 3], [4, 3], [4, 4]],
  [[5, 3], [6, 3], [7, 3], [7, 4], [6, 4], [5, 4]],
  [[11, 2], [12, 2], [12, 3], [11, 3], [11, 4], [12, 4]],
  [[11, 5], [11, 7], [12, 7], [12, 6], [11, 6], [12, 5]],
  [[5, 7], [6, 7], [7, 7], [8, 7], [8, 6], [8, 5]],
  [[7, 10], [7, 9], [7, 8], [8, 8], [9, 8], [10, 8]],
];

// The two drawn givens: [row, col, value], 0-indexed.
const GIVENS = [[3, 1, 4], [11, 14, 6]];

// The 16 drawn outside clues (each split into sign/threshold; `kind`/`index`
// locate the physical row/column, 0-indexed). Each is read as an inequality
// on the sandwich sum (see the comment above `sandwichSpec` below): the sum
// of the digits strictly between the row/column's two 1's is greater/less
// than the printed number.
const CLUES = [
  { kind: 'row', index: 2, sign: '>', n: 28 },
  { kind: 'row', index: 3, sign: '>', n: 29 },
  { kind: 'row', index: 4, sign: '>', n: 9 },
  { kind: 'row', index: 7, sign: '<', n: 30 },
  { kind: 'col', index: 2, sign: '>', n: 37 },
  { kind: 'col', index: 3, sign: '<', n: 15 },
  { kind: 'col', index: 4, sign: '>', n: 15 },
  { kind: 'col', index: 12, sign: '<', n: 11 },
  { kind: 'row', index: 11, sign: '<', n: 11 },
  { kind: 'row', index: 12, sign: '<', n: 7 },
  { kind: 'col', index: 6, sign: '<', n: 31 },
  { kind: 'col', index: 7, sign: '>', n: 11 },
  { kind: 'row', index: 13, sign: '>', n: 36 },
  { kind: 'row', index: 8, sign: '>', n: 17 },
  { kind: 'col', index: 13, sign: '>', n: 38 },
  { kind: 'col', index: 11, sign: '>', n: 21 },
];

// Which of the five grids' bounding boxes contain a physical cell (0, 1 or 2
// grids; 2 only inside a shared region).
function gridsAt(row, col) {
  return Object.keys(GRID_ORIGINS).filter(name => {
    const [r0, c0] = GRID_ORIGINS[name];
    return row >= r0 && row < r0 + 6 && col >= c0 && col < c0 + 6;
  });
}

// A physical cell's id within one grid's own 6x6 local frame.
function localId(name, row, col) {
  const [r0, c0] = GRID_ORIGINS[name];
  return makeCellId(row - r0 + 1, col - c0 + 1);
}

const graph = cellGraph('6x6');
const overlays = {
  A: graph.makeOverlay('VA'),
  B: graph.makeOverlay('VB'),
  C: graph.makeOverlay('VC'),
  D: graph.makeOverlay('VD'),
  E: graph.makeOverlay('VE'),
};

// The Var cell representing a physical board cell. For a cell shared with C,
// this picks the corner grid's copy; the SameValues equalities below tie it
// to C's own copy, so either choice names the same value.
function varAt(row, col) {
  const [name] = gridsAt(row, col);
  return overlays[name].at(localId(name, row, col));
}

// Each region's own all-different, expressed once (on C, for a shared
// region) even though a shared region also belongs to a corner grid.
const regionConstraints = REGIONS.map((region) => {
  const memberships = gridsAt(...region[0]);
  const owner = memberships.includes('C') ? 'C' : memberships[0];
  return new AllDifferent(
    ...region.map(([r, c]) => overlays[owner].at(localId(owner, r, c))));
});

// A shared region's cells are the same physical cell in two grids' Var
// overlays; pin them equal.
const equalityConstraints = REGIONS.flatMap((region) => {
  const memberships = gridsAt(...region[0]);
  if (memberships.length < 2) return [];
  const corner = memberships.find(name => name !== 'C');
  return region.map(([r, c]) => new SameValues(
    2, overlays.C.at(localId('C', r, c)), overlays[corner].at(localId(corner, r, c))));
});

// Each grid's own 6 rows and 6 columns, in its local frame.
const rowColConstraints = Object.values(overlays)
  .flatMap(overlay => [...overlay.rows(), ...overlay.columns()])
  .map(cells => new AllDifferent(...cells));

const givenConstraints = GIVENS.map(([r, c, v]) => new Given(varAt(r, c), v));

// The real (in-grid) cells of a physical row/column, left-to-right or
// top-to-bottom; a non-playable gap cell is simply absent.
function lineCells(kind, index) {
  const cells = [];
  for (let i = 1; i <= 14; i++) {
    const [row, col] = kind === 'row' ? [index, i] : [i, index];
    if (gridsAt(row, col).length) cells.push(varAt(row, col));
  }
  return cells;
}

// "Sum of the digits between two 1's": scan for the first and second 1 in
// the line (regardless of which grid's window each belongs to -- a
// three-grid line, e.g. column 6, can have up to three window-1's, but the
// rule still names "that ... column" as one physical line), summing the real
// cells strictly between them, then compare to the clue's threshold. Any
// line with fewer than two 1's, or a running sum that fails the compare at
// the second 1, is rejected. This is also what forces the two 1's on a line
// through a shared region to sit in different physical cells: coincidence at
// the single shared cell would leave only one 1 in the line, which fails the
// count.
function sandwichSpec(compare) {
  return NFA.encodeSpec({
    startState: { phase: 0, sum: 0 },
    transition({ phase, sum }, value) {
      if (phase === 2) return { phase: 2, sum: 0 };
      if (phase === 0) {
        return value === 1 ? { phase: 1, sum: 0 } : { phase: 0, sum: 0 };
      }
      if (value === 1) {
        return compare(sum) ? { phase: 2, sum: 0 } : undefined;
      }
      return { phase: 1, sum: sum + value };
    },
    accept: ({ phase }) => phase === 2,
    // No clued line has more than 14 real cells; bounds state creation so the
    // (otherwise-unbounded) running sum can't blow the compiled-state limit.
    maxDepth: 14,
  }, 6);
}

const sandwichConstraints = CLUES.map(({ kind, index, sign, n }) => {
  const compare = sign === '>' ? (sum => sum > n) : (sum => sum < n);
  return new NFA(sandwichSpec(compare), '', ...lineCells(kind, index));
});

return [
  // The answer lives in VA/VB/VC/VD/VE, so the main grid is a pinned
  // placeholder; '1-6' gives the Var groups their real domain.
  new Shape('1x1', '1-6'),
  new Given('R1C1', 1),
  overlays.A.toVar('grid A (top-left)'),
  overlays.B.toVar('grid B (top-right)'),
  overlays.C.toVar('grid C (centre)'),
  overlays.D.toVar('grid D (bottom-left)'),
  overlays.E.toVar('grid E (bottom-right)'),
  ...regionConstraints,
  ...equalityConstraints,
  ...rowColConstraints,
  ...givenConstraints,
  ...sandwichConstraints,
];
