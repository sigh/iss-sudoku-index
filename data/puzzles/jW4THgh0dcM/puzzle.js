// Title: Grundriss
// Author: Myxo
// Video: https://www.youtube.com/watch?v=jW4THgh0dcM
// Source: https://sudokupad.app/3dr1ufz01v

// Rules encoded here (Myxo's "Latin Square Jam" genre):
//  - Divide the grid into square-shaped regions; every cell belongs to
//    exactly one square. The stored alphabet is only 1-6, so the largest
//    possible square is 6x6 -- the grid does not otherwise bound the side.
//  - Fill each region of size NxN with 1-N so no number repeats in any row
//    or column *of the region*.
//  - Same digit cannot touch orthogonally anywhere in the grid, region
//    borders included.
//  - Arrows: digits along the arrow sum to the circled (bulb) cell.
//  - Grey thermometers: strictly increasing from the bulb.
//  - Pink lines: Renban (non-repeating consecutive set, any order).
// Nothing is omitted.

// The board is 12x18, but every ISS Shape/overlay dimension caps at 16 (see
// CellGeometry.MAX_SIZE), so the real 216-cell grid cannot be a Shape at all
// -- not even split into two column halves, since the row/column run scans
// below each have to read a whole 18-cell row or 12-cell column in one pass,
// and a scan cannot cross from one graph/overlay into another. Instead each
// layer (the puzzle's own answer, BOARD, plus the undrawn region geometry
// SIDE/REDGE/BEDGE) is twelve small Var groups, one 18x1-declared group per
// grid row (18 "rows" of a single "column", so its own column count -- the
// one the 16 cap checks -- is 1) -- addressed within a row by the
// two-argument `cell(c, 1)`, never folded arithmetic of this script's own.
// A throwaway 1x1 Shape supplies the shared 1-6 value range every group
// needs and is pinned so it contributes no extra solutions. The result's
// `solution_group` lists BOARD's twelve row groups in row order, so their
// concatenation reproduces the stored solution's own row-major string with
// no reordering.
const N_ROWS = 12;
const N_COLS = 18;
const MAXV = 6;
const ROW_LETTER = 'ABCDEFGHIJKL'; // row 1-12 -> a Var-prefix-safe letter (A-Z only, no digits)

const anchorShape = new Shape('1x1', `1-${MAXV}`);
const anchorGiven = new Given('R1C1', 1);

// Twelve single-row Var groups (one per grid row), addressed as a 2D board
// via (row, col) -> cell id.
// Each row group is declared 'RxC' (N_COLS x 1: N_COLS "rows" of a single
// "column"), not a bare flat count, so the puzzle's cell layout is legible
// straight from puzzle.iss instead of resting on this script's own stride
// arithmetic; `cell(c, 1)` is the two-argument dimension-aware form, which
// folds against the *declared* columns (1) rather than any hand-rolled
// multiplication of its own.
const makeBoard = (prefix, label) => {
  const rows = Array.from({ length: N_ROWS }, (_, i) =>
    new Var(`${prefix}${ROW_LETTER[i]}`, `${label}, row ${i + 1}`, `${N_COLS}x1`));
  return { rows, at: (r, c) => rows[r - 1].cell(c, 1) };
};

const BOARD = makeBoard('BOARD', 'board digit'); // the puzzle's own answer
const SIDE = makeBoard('SIDE', 'square side length (1-6)');
const REDGE = makeBoard('REDGE', 'rightmost column of its square (1 yes / 2 no)');
const BEDGE = makeBoard('BEDGE', 'bottom row of its square (1 yes / 2 no)');

// (row, col) convenience for the drawn clues below, which map onto BOARD --
// plain numeric coordinates transcribed from the payload's geometry, not
// cell ids parsed back apart.
const RC = (r, c) => BOARD.at(r, c);

const rowCells = (board, r) =>
  Array.from({ length: N_COLS }, (_, i) => board.at(r, i + 1));
const colCells = (board, c) =>
  Array.from({ length: N_ROWS }, (_, i) => board.at(i + 1, c));
const interleave = (a, b) => a.flatMap((cell, i) => [cell, b[i]]);

// REDGE/BEDGE only ever hold 1 or 2 out of the shared 1-6 range, but this
// needs no separate restriction: every REDGE cell is read as the flag
// symbol of its row's geometry run-scan below, and every BEDGE cell as the
// flag symbol of its column's, and both scans' transition function already
// rejects any flag value outside {1, 2} outright (the `edge` phase checks
// `value !== expected`) -- so a 3-6 flag value already has no accepting
// continuation in the one scan the rules require every cell to pass. BOARD
// and SIDE use their whole shared range and need no restriction either.

// Run scan (square-partition geometry, following Square Jam / Corners and
// Sum Lines): reading a line as side length interleaved with its edge flag,
// a run of s equal side lengths must close exactly at the sth cell (flag 1),
// every earlier cell of the run flagged 2, and the following cell always
// starting fresh -- so two same-size squares placed back to back stay two
// runs instead of merging into one long one.
const runNFA = NFA.encodeSpec({
  startState: { p: 'sz', L: 0 },
  transition: (state, value) => {
    if (state.p === 'sz') {
      if (state.L === 0) return { p: 'edge', sz: value, after: value - 1 };
      if (value !== state.sz) return undefined;
      return { p: 'edge', sz: state.sz, after: state.L - 1 };
    }
    const expected = state.after === 0 ? 1 : 2;
    if (value !== expected) return undefined;
    return state.after === 0
      ? { p: 'sz', L: 0 }
      : { p: 'sz', L: state.after, sz: state.sz };
  },
  accept: (state) => state.p === 'sz' && state.L === 0,
}, anchorShape);

const rowGeomRuns = [];
for (let r = 1; r <= N_ROWS; r++) {
  rowGeomRuns.push(new NFA(runNFA, `rowsz${r}`,
    ...interleave(rowCells(SIDE, r), rowCells(REDGE, r))));
}
const colGeomRuns = [];
for (let c = 1; c <= N_COLS; c++) {
  colGeomRuns.push(new NFA(runNFA, `colsz${c}`,
    ...interleave(colCells(SIDE, c), colCells(BEDGE, c))));
}

// Flag agreement -- required above 8x8 (see Corners and Sum Lines' notes):
// two cells one above the other in the same square must agree on where its
// right edge falls, and two cells side by side in the same square must agree
// on where its bottom edge falls. Without this, the row/column run scans
// alone also admit "pinwheel" arrangements of overlapping blocks that tile
// nothing.
const flagsAgree = [];
for (let r = 1; r <= N_ROWS; r++) {
  for (let c = 1; c <= N_COLS; c++) {
    if (r < N_ROWS) {
      flagsAgree.push(new Or([
        new Given(BEDGE.at(r, c), 1),
        new SameValues(2, REDGE.at(r, c), REDGE.at(r + 1, c)),
      ]));
    }
    if (c < N_COLS) {
      flagsAgree.push(new Or([
        new Given(REDGE.at(r, c), 1),
        new SameValues(2, BEDGE.at(r, c), BEDGE.at(r, c + 1)),
      ]));
    }
  }
}

// Each cell's digit is capped by its own square's side length: a region of
// size NxN only ever holds 1-N.
const sizeCapKey = Pair.fnToKey((sz, d) => d <= sz, anchorShape);
const sizeCaps = [];
for (let r = 1; r <= N_ROWS; r++) {
  for (let c = 1; c <= N_COLS; c++) {
    sizeCaps.push(new Pair(sizeCapKey, 'digit<=side', SIDE.at(r, c), BOARD.at(r, c)));
  }
}

// No number repeats in a region's own row or column: scan each grid row and
// column as digit interleaved with the same REDGE/BEDGE edge flag used
// above, carrying a bitmask of digits seen since the run's last close
// (reject on a repeat). Because every cell's digit is already capped at its
// own square's side length (sizeCaps, above), and a run closed by
// REDGE/BEDGE spans exactly one square's own row or column segment, "no
// repeat within the run" already *is* the Latin-square property: s cells
// each restricted to 1-s with no repeat are forced into a permutation of 1-s
// by pigeonhole, so no separate full-coverage check is needed.
const latinNFA = NFA.encodeSpec({
  startState: { onDigit: true, mask: 0 },
  transition: (state, value) => {
    if (state.onDigit) {
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      return { onDigit: false, mask: state.mask | bit };
    }
    if (value === 1) return { onDigit: true, mask: 0 };
    if (value === 2) return { onDigit: true, mask: state.mask };
    return undefined;
  },
  accept: (state) => state.onDigit && state.mask === 0,
}, anchorShape);

const rowLatinRuns = [];
for (let r = 1; r <= N_ROWS; r++) {
  rowLatinRuns.push(new NFA(latinNFA, `rowlatin${r}`,
    ...interleave(rowCells(BOARD, r), rowCells(REDGE, r))));
}
const colLatinRuns = [];
for (let c = 1; c <= N_COLS; c++) {
  colLatinRuns.push(new NFA(latinNFA, `collatin${c}`,
    ...interleave(colCells(BOARD, c), colCells(BEDGE, c))));
}

// Global no-touch: the same digit may never sit in two orthogonally adjacent
// cells anywhere in the grid, region borders included -- so this is
// unconditional over the whole grid, not scoped to region interiors (the
// Latin-square runs above already forbid same-run repeats; this adds the
// across-border case the rule names explicitly, plus any other adjacent
// pair the row/column runs do not already cover). A 2-cell AllDifferent
// states "these two differ" directly, more idiomatically than a custom Pair.
const noTouch = [];
for (let r = 1; r <= N_ROWS; r++) {
  for (let c = 1; c <= N_COLS; c++) {
    if (c < N_COLS) {
      noTouch.push(new AllDifferent(BOARD.at(r, c), BOARD.at(r, c + 1)));
    }
    if (r < N_ROWS) {
      noTouch.push(new AllDifferent(BOARD.at(r, c), BOARD.at(r + 1, c)));
    }
  }
}

// Arrows: bulb (control cell) first, then arm cells, transcribed from the
// payload's `arrows` waypoints as (row, col) pairs. The bulb is the cell
// under the matching white circle overlay; two arrows may share one circle
// (R2C2 and R2C5 each carry two).
const arrows = [
  new Arrow(RC(2, 2), RC(2, 1), RC(1, 1)),
  new Arrow(RC(2, 2), RC(3, 2), RC(3, 1)),
  new Arrow(RC(5, 1), RC(6, 2)),
  new Arrow(RC(2, 5), RC(1, 6)),
  new Arrow(RC(2, 5), RC(3, 6)),
  new Arrow(RC(2, 8), RC(3, 7), RC(4, 6)),
  new Arrow(RC(3, 11), RC(2, 12), RC(2, 13), RC(2, 14)),
  new Arrow(RC(10, 6), RC(9, 5), RC(8, 4), RC(7, 3), RC(6, 4), RC(7, 5), RC(6, 6)),
];

// Thermometers: grey lines, bulb end first, transcribed from the payload's
// `lines` waypoints as (row, col) pairs. Four are drawn tip-first (the grey
// bulb underlay sits at the LAST waypoint of the stroke, not the first), so
// those four are reversed here from the payload's drawn order.
const thermos = [
  new Thermo(RC(10, 18), RC(11, 17), RC(12, 18)),
  new Thermo(RC(6, 16), RC(5, 17)),
  new Thermo(RC(5, 14), RC(4, 13)),
  new Thermo(RC(5, 13), RC(4, 12)),
  new Thermo(RC(5, 11), RC(4, 10)),
  new Thermo(RC(5, 10), RC(5, 9), RC(6, 8), RC(7, 8), RC(8, 8)),
];

// Renban: pink lines, order-independent, transcribed from the payload's
// `lines` waypoints as (row, col) pairs (diagonal jumps interpolated to the
// cells they cross).
const renbans = [
  new Renban(RC(5, 3), RC(5, 4), RC(6, 5), RC(7, 6), RC(8, 7)),
  new Renban(RC(5, 6), RC(5, 7), RC(4, 8), RC(3, 8)),
  new Renban(RC(3, 15), RC(2, 16), RC(1, 17)),
  new Renban(RC(9, 6), RC(10, 7), RC(11, 6), RC(10, 5)),
  new Renban(RC(11, 11), RC(10, 12), RC(9, 13)),
  new Renban(RC(10, 14), RC(9, 15), RC(8, 16)),
];

return [
  anchorShape, anchorGiven,
  ...BOARD.rows, ...SIDE.rows, ...REDGE.rows, ...BEDGE.rows,
  ...rowGeomRuns, ...colGeomRuns,
  ...flagsAgree,
  ...sizeCaps,
  ...rowLatinRuns, ...colLatinRuns,
  ...noTouch,
  ...arrows, ...thermos, ...renbans,
];
