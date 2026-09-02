// Title: Jello
// Author: zetamath and chat
// Video: https://www.youtube.com/watch?v=-QG7AXNf-xw
// Source: https://tinyurl.com/3by9x64s

// Rules encoded, in full:
//  - Into each non-gray cell place a digit from 1-9. Digits cannot repeat
//    within a row, column or box. Gray cells hold no digit.
//  - Every digit is part of an orthogonally connected clump of digits that
//    sums to 10. Digits may repeat within clumps. Clumps do not overlap, and
//    every digit is in one.
//  - A circled cell gives the number of clumps in the up to 9 cells of its
//    3x3 neighbourhood, itself included.
//
// The gray cells are holes in the Sudoku units, so the grid is a Raw grid
// (no implicit row/column/box rules) with the units stated over their non-gray
// cells only. BLANK is the value parked on a gray cell.
//
// The clump partition is carried by five whole-grid overlays plus two
// same-clump edge flags. Each clump is stored as a tree rooted at its own
// lowest-numbered cell:
//   VR, VC  the row and column of the clump's root, so two cells share a clump
//           exactly when they agree on both;
//   VD      1 + the distance from the root inside the clump;
//   VP      the direction of this cell's parent (or ROOT);
//   VA      the sum of the digits in this cell's subtree, so the root's VA is
//           the clump total;
//   VH, VV  1/2 flags saying whether a cell shares a clump with its right and
//           lower neighbour.
// Root-at-the-lowest-cell, VD as the exact distance and the fixed U,L,R,D
// tie-break for VP make the overlays a function of the partition alone, so a
// partition has exactly one representation here.

const NUM_VALUES = 11;   // 1-9 digits, 10 for a whole clump total, 11 = BLANK
const BLANK = 11;
const ROOT = 5;          // VP value for a clump root

// Gray cells: the light-gray rectangles drawn under the grid.
const GRAY = [
  'R1C1', 'R1C3', 'R1C5', 'R1C8', 'R1C9',
  'R2C8', 'R2C9',
  'R3C1', 'R3C9',
  'R4C2',
  'R5C5', 'R5C6', 'R5C7',
  'R6C3', 'R6C4',
  'R7C6', 'R7C7', 'R7C8',
  'R8C5', 'R8C6', 'R8C7',
  'R9C1', 'R9C2', 'R9C3',
];

// Circled cells: the white circles drawn on the grid.
const CIRCLES = ['R1C2', 'R2C1', 'R2C7', 'R3C3', 'R8C1'];

// Parent directions, in the order they are scanned. That order is also the
// tie-break when several neighbours sit one step closer to the root, so the
// spanning tree of a clump is determined by the clump.
const DIRS = [
  { code: 1, dr: -1, dc: 0 },   // up
  { code: 2, dr: 0, dc: -1 },   // left
  { code: 3, dr: 0, dc: 1 },    // right
  { code: 4, dr: 1, dc: 0 },    // down
];
const OPPOSITE = { 1: 4, 2: 3, 3: 2, 4: 1 };

const shape = new Shape('9x9', NUM_VALUES, 'Raw');
const graph = cellGraph(shape);
const grayCells = new Set(GRAY);
const isGray = (cell) => grayCells.has(cell);
const gray = graph.cells().filter(cell => isGray(cell));
const filled = graph.cells().filter(cell => !isGray(cell));
const index = (cell) => {
  const { row, col } = parseCellId(cell);
  return (row - 1) * 9 + col;
};

const parentDir = graph.makeOverlay('VP');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');
const subSum = graph.makeOverlay('VA');
const sameRight = graph.makeOverlay('VH');
const sameDown = graph.makeOverlay('VV');

// The in-grid neighbours of a cell, in scan order, with the flag cell that says
// whether the two share a clump. A horizontal flag lives on the left cell of
// its pair and a vertical flag on the upper cell.
const neighboursOf = (cell) => DIRS.flatMap(dir => {
  const other = graph.step(cell, dir.dr, dir.dc);
  if (other === null) return [];
  const flag = dir.code === 1 ? sameDown.at(other)
    : dir.code === 2 ? sameRight.at(other)
      : dir.code === 3 ? sameRight.at(cell)
        : sameDown.at(cell);
  return [{ code: dir.code, cell: other, flag }];
});

// --- Sudoku layer -----------------------------------------------------------

const boxes = [1, 4, 7].flatMap(
  row => [1, 4, 7].map(col => graph.block(makeCellId(row, col), 3, 3)));
const units = [...graph.rows(), ...graph.columns(), ...boxes]
  .map(unit => unit.filter(cell => !isGray(cell)))
  .map(unit => new AllDifferent(...unit));

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const gridGivens = [
  graph.makeReplicate(new Given(graph.cells()[0], ...digits), filled),
  ...gray.map(cell => new Given(cell, BLANK)),
];

// --- Overlay domains --------------------------------------------------------

// A parent must be a non-gray neighbour, so that domain varies per cell; a
// clump holds at most ten cells (ten 1s), so VD and VA never exceed 10.
const overlayGivens = [
  ...[parentDir, rootRow, rootCol, depth, subSum].flatMap(
    overlay => gray.map(cell => new Given(overlay.at(cell), BLANK))),
  ...filled.map(cell => new Given(
    parentDir.at(cell),
    ...neighboursOf(cell).filter(n => !isGray(n.cell)).map(n => n.code),
    ROOT)),
  ...[rootRow, rootCol].map(overlay => overlay.makeReplicate(
    new Given(overlay.cells()[0], ...digits), overlay.at(filled))),
  ...[depth, subSum].map(overlay => overlay.makeReplicate(
    new Given(overlay.cells()[0], ...digits, 10), overlay.at(filled))),
];

// A flag is live only where both of its cells hold digits; elsewhere it is
// pinned to "different clumps" so nothing is left free.
const flagCells = [
  ...graph.cells().map(cell => (
    { flag: sameRight.at(cell), pair: [cell, graph.step(cell, 0, 1)] })),
  ...graph.cells().map(cell => (
    { flag: sameDown.at(cell), pair: [cell, graph.step(cell, 1, 0)] })),
];
const liveFlags = flagCells.filter(
  ({ pair }) => pair[1] !== null && !isGray(pair[0]) && !isGray(pair[1]));
const liveFlagSet = new Set(liveFlags.map(f => f.flag));
const flagGivens = flagCells.map(
  ({ flag }) => liveFlagSet.has(flag) ? new Given(flag, 1, 2) : new Given(flag, 1));

// --- The clump root is the lowest-numbered cell of its clump ----------------

// One key per cell: (VR, VC) may only name a non-gray cell that does not come
// after this one in reading order.
const rootKeys = filled.map(cell => new Pair(
  Pair.fnToKey(
    (row, col) => row <= 9 && col <= 9
      && !isGray(makeCellId(row, col))
      && (row - 1) * 9 + col <= index(cell),
    shape),
  'root', rootRow.at(cell), rootCol.at(cell)));

// --- Same-clump flags -------------------------------------------------------

// Reads [flag, VR, VC, VR, VC] over the flag and its two cells: the flag is 2
// exactly when the two cells name the same root.
const sameSpec = NFA.encodeSpec({
  startState: { p: 0 },
  transition: (state, value) => {
    // Reject out-of-domain values up front so the compiled state count stays
    // small; the Given constraints exclude them anyway.
    if (state.p === 0) return value > 2 ? undefined : { p: 1, f: value };
    if (value > 9) return undefined;
    switch (state.p) {
      case 1: return { p: 2, f: state.f, r: value };
      case 2: return { p: 3, f: state.f, r: state.r, c: value };
      case 3: return {
        p: 4, f: state.f, r: state.r, c: state.c, rowEq: value === state.r,
      };
      default: {
        const same = state.rowEq && value === state.c;
        return same === (state.f === 2) ? { p: 5 } : undefined;
      }
    }
  },
  accept: (state) => state.p === 5,
  maxDepth: 5,
}, shape);

const sameFlags = liveFlags.map(({ flag, pair }) => new NFA(
  sameSpec, 'same clump', flag,
  rootRow.at(pair[0]), rootCol.at(pair[0]),
  rootRow.at(pair[1]), rootCol.at(pair[1])));

// --- Root propagation -------------------------------------------------------

// Reads [VP, X, X of each neighbour in scan order] where X is VR or VC: a root
// names its own coordinate, any other cell copies its parent's.
const rootCoordSpec = (codes, own) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (state, value) => {
    if (state.p === 0) return value > ROOT ? undefined : { p: 1, pd: value };
    if (state.p === 1) {
      if (value > 9) return undefined;
      if (state.pd === ROOT && value !== own) return undefined;
      return { p: 2, pd: state.pd, x: value };
    }
    const code = codes[state.p - 2];
    if (code === state.pd && value !== state.x) return undefined;
    return { p: state.p + 1, pd: state.pd, x: state.x };
  },
  accept: (state) => state.p === codes.length + 2,
  maxDepth: codes.length + 2,
}, shape);

const rootPropagation = filled.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  const codes = neighbours.map(n => n.code);
  return [
    new NFA(
      rootCoordSpec(codes, row), 'root row', parentDir.at(cell),
      rootRow.at(cell), ...neighbours.map(n => rootRow.at(n.cell))),
    new NFA(
      rootCoordSpec(codes, col), 'root col', parentDir.at(cell),
      rootCol.at(cell), ...neighbours.map(n => rootCol.at(n.cell))),
  ];
});

// --- Depth and parent choice ------------------------------------------------

// Reads [VD, (flag, VD) per neighbour in scan order, VP]. No same-clump
// neighbour may be more than one step closer to the root, the parent is the
// first neighbour in scan order that is exactly one step closer, and a cell
// with no such neighbour is the root at distance 0.
const depthSpec = (codes) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (state, value) => {
    if (state.p === 0) {
      return value > 10 ? undefined : { p: 1, d: value, fd: 0 };
    }
    const i = state.p - 1;
    if (i === 2 * codes.length) {
      const want = state.fd === 0 ? ROOT : codes[state.fd - 1];
      if (value !== want) return undefined;
      if (state.fd === 0 && state.d !== 1) return undefined;
      return { p: state.p + 1, d: state.d, fd: state.fd };
    }
    if ((i & 1) === 0) {
      if (value > 2) return undefined;
      return { p: state.p + 1, d: state.d, fd: state.fd, near: value === 2 };
    }
    if (!state.near) return { p: state.p + 1, d: state.d, fd: state.fd };
    if (value < state.d - 1) return undefined;
    const fd = (value === state.d - 1 && state.fd === 0)
      ? (i >> 1) + 1 : state.fd;
    return { p: state.p + 1, d: state.d, fd };
  },
  accept: (state) => state.p === 2 * codes.length + 2,
  maxDepth: 2 * codes.length + 2,
}, shape);

const depthRules = filled.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    depthSpec(neighbours.map(n => n.code)), 'clump depth',
    depth.at(cell),
    ...neighbours.flatMap(n => [n.flag, depth.at(n.cell)]),
    parentDir.at(cell));
});

// --- Clump totals -----------------------------------------------------------

// Reads [VP, VA, digit, (VP, VA) per neighbour in scan order]: a cell's subtree
// sum is its own digit plus the subtree sums of the neighbours that name it as
// their parent, and a root's subtree sum is the clump total of 10.
const accSpec = (codes) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: (state, value) => {
    if (state.p === 0) {
      return value > ROOT ? undefined : { p: 1, root: value === ROOT };
    }
    if (state.p === 1) {
      if (value > 10) return undefined;
      if (state.root && value !== 10) return undefined;
      return { p: 2, need: value };
    }
    if (state.p === 2) {
      if (value > 9) return undefined;
      const need = state.need - value;
      return need < 0 ? undefined : { p: 3, need };
    }
    const i = state.p - 3;
    if ((i & 1) === 0) {
      const child = value === OPPOSITE[codes[i >> 1]];
      return { p: state.p + 1, need: state.need, child };
    }
    if (!state.child) return { p: state.p + 1, need: state.need };
    const need = state.need - value;
    return need < 0 ? undefined : { p: state.p + 1, need };
  },
  accept: (state) => state.p === 2 * codes.length + 3 && state.need === 0,
  maxDepth: 2 * codes.length + 3,
}, shape);

const clumpTotals = filled.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    accSpec(neighbours.map(n => n.code)), 'clump total',
    parentDir.at(cell), subSum.at(cell), cell,
    ...neighbours.flatMap(n => [parentDir.at(n.cell), subSum.at(n.cell)]));
});

// --- Circles ----------------------------------------------------------------

// "the number of clumps in the up to 9 surrounding cells (including itself)":
// the parenthetical places the circled cell among the counted cells, so a clump
// counts when it holds any cell of the neighbourhood, not only when it lies
// wholly inside. A gray cell is in no clump, so it drops out of the window.
const windows = CIRCLES.map(
  cell => graph.kingNeighbours(cell).concat([cell])
    .filter(c => !isGray(c))
    .sort((a, b) => index(a) - index(b)));
// One flag per cell of a circle's neighbourhood, 2 when that cell is the first
// of its clump in the neighbourhood's reading order, so the flags set to 2
// count the clumps present exactly once each.
const flagCount = windows.reduce((total, window) => total + window.length, 0);
const windowFlags = new Var('F', 'first cell of its clump in a circle', flagCount);

// Reads [flag, VR, VC, (VR, VC) of every earlier cell of the neighbourhood]:
// the flag is 2 exactly when no earlier cell names the same root.
const firstSpec = NFA.encodeSpec({
  startState: { p: 0 },
  transition: (state, value) => {
    if (state.p === 0) return value > 2 ? undefined : { p: 1, f: value };
    if (value > 9) return undefined;
    switch (state.p) {
      case 1: return { p: 2, f: state.f, r: value };
      case 2: return { p: 3, f: state.f, r: state.r, c: value, seen: false };
      // eslint-disable-next-line no-fallthrough
      case 3: return {
        p: 4, f: state.f, r: state.r, c: state.c, seen: state.seen,
        rowEq: value === state.r,
      };
      default: return {
        p: 3, f: state.f, r: state.r, c: state.c,
        seen: state.seen || (state.rowEq && value === state.c),
      };
    }
  },
  accept: (state) => state.p === 3 && state.seen === (state.f === 1),
  maxDepth: 19,   // flag + 9 neighbourhood cells at two coordinates each
}, shape);

let flagAt = 0;
const circleRules = windows.flatMap((window, w) => {
  const flags = window.map(() => windowFlags.cell(++flagAt));
  const marks = window.map((cell, i) => new NFA(
    firstSpec, 'new clump', flags[i],
    ...window.slice(0, i + 1).reverse().flatMap(
      earlier => [rootRow.at(earlier), rootCol.at(earlier)])));
  // The flags are 1/2 rather than 0/1, so the count is their sum less one per
  // cell of the neighbourhood.
  const count = new Sum(window.length, ...flags, [CIRCLES[w], -1]);
  return [...marks, count];
});

return [
  shape,
  parentDir.toVar('parent direction'),
  rootRow.toVar('clump root row'),
  rootCol.toVar('clump root column'),
  depth.toVar('distance from clump root'),
  subSum.toVar('subtree total'),
  sameRight.toVar('shares a clump with the cell to the right'),
  sameDown.toVar('shares a clump with the cell below'),
  windowFlags,
  ...gridGivens,
  ...units,
  ...overlayGivens,
  ...flagGivens,
  ...rootKeys,
  ...sameFlags,
  ...rootPropagation,
  ...depthRules,
  ...clumpTotals,
  ...circleRules,
];
