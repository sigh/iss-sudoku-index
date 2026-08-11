// Title: Jormungandr
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=voxX1f6hGxo
// Source: https://tinyurl.com/yt5dzj2f

// Rules encoded here:
//  1. Nine non-overlapping 3x3 regions are placed in an 11x11 grid (location
//     unknown -- part of the puzzle). Each region holds the digits 1-9 once
//     each. Cells outside every region stay empty.
//  2. Digits may not repeat in a region, a row, or a column.
//  3. The drawn line is a single path of 113 distinct cells, given below as
//     the ten rendered segments concatenated end-to-end (each segment's
//     first cell is the previous segment's last cell). Split the path into
//     "passes": maximal runs of consecutive path cells that lie inside one
//     particular region (a blank cell, a change of region, or the path
//     ending closes a pass; visiting the same region again later starts a
//     new one). Every pass's digit sum is the same value across the whole
//     line.
// Nothing is omitted.
//
// The 11x11 canvas is Raw, not a default Sudoku-type main grid: a Sudoku main
// grid's row is always all-different, while here a row holds at most one of
// each digit and any number of empty cells. Raw carries no implicit
// constraints, so every rule below is stated explicitly; the main grid cells
// hold 1-9 = the digit in this cell, 0 = no digit.
//
// Region placement uses a corner-indicator layer (1 = a region's top-left
// corner is here) plus one per-cell Sum over the window of corners that
// could cover that cell, which is simultaneously the tiling rule and the
// non-overlap rule (a fixed-size-blocks-at-unknown-positions pattern).
//
// The value range is widened to 0-11 (only 0-9 are ever used by the main
// grid) purely so the auxiliary SAME-REGION layer below (values 10/11) can
// never be confused with a real digit token by the pass-sum state machine.

const shape = new Shape('11x11', '0-11', 'Raw');
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();

const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// T: 1 = a 3x3 region has its top-left corner here, 2 = no.
// F: 1 = this cell lies inside some region, 2 = no.
const T = grid.makeOverlay('VT');
const F = grid.makeOverlay('VF');

const overlayDomain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  overlayDomain(grid, BLANK, ...DIGITS),
  overlayDomain(T, 1, 2),
  overlayDomain(F, 1, 2),
];

// A region corner needs a whole 3x3 block below and right of it.
const cornerRoom = T.makeReplicate(
  new Given(T.cells()[0], 2),
  T.at(cells.filter(cell => grid.block(cell, 3, 3) === null)));

const filledKey = Pair.fnToKey((d, f) => (d !== BLANK) === (f === 1), geom);
const filled = cells.map(cell => new Pair(filledKey, 'filled', cell, F.at(cell)));

// The candidate top-left corners whose 3x3 footprint covers `cell`.
function coveringAnchors(cell) {
  const anchors = [];
  for (let dRow = -2; dRow <= 0; dRow++) {
    for (let dCol = -2; dCol <= 0; dCol++) {
      const corner = grid.step(cell, dRow, dCol);
      if (corner !== null) anchors.push(corner);
    }
  }
  return anchors;
}

// A cell is inside a region exactly when one region corner sits in the 3x3
// window that ends at it, and no more than one may: that single equation is
// both "the regions tile the filled cells" and "the regions do not overlap".
// T is 1 = yes / 2 = no, so a count of yeses over n cells is 2n minus their
// sum.
const coverage = cells.map(cell => {
  const window = T.at(coveringAnchors(cell));
  return window.length === 1
    ? new SameValues(2, window[0], F.at(cell))
    : new Sum(2 * window.length - 2, ...window, [F.at(cell), -1]);
});

// Nine regions of nine cells fill 81 of the 121 cells.
const regionTotal = new Sum(2 * cells.length - 81, ...F.cells());

// Where a region does start, its nine cells are all different; drawn from
// 1-9 (every cell of a region is filled) that is the digits 1-9 once each.
const regionDigits = cells
  .filter(cell => grid.block(cell, 3, 3) !== null)
  .map(cell => new Or([
    new Given(T.at(cell), 2),
    new AllDifferent(...grid.block(cell, 3, 3)),
  ]));

// Rows and columns hold at most one of each digit; blanks may repeat, which
// no AllDifferent can say, so the pairwise relation states it directly.
const rowColKey = PairX.fnToKey((a, b) => a !== b || a === BLANK, geom);
const rowsAndColumns = [...grid.rows(), ...grid.columns()].map(
  house => new PairX(rowColKey, 'no-repeat', ...house));

// ---- The line's pass-sum rule ----

// The single drawn path, concatenated from the ten rendered segments
// end-to-end (segment n's first cell is segment n-1's last cell). Cell ids
// past column/row 9 are not decimal ('R10C1', 'R11C1', ...): row and column
// digits above 9 are letters, so the path is written as [row, col] pairs and
// converted with makeCellId(row, col) instead of hand-typed 'R#C#' strings.
const PATH = [
  [11, 2], [11, 1], [10, 1], [9, 1], [9, 2], [8, 2], [8, 3], [7, 2], [7, 1],
  [6, 1], [5, 1], [4, 1], [3, 1], [2, 1], [1, 2], [2, 2], [3, 3], [4, 3],
  [5, 4], [5, 5], [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [5, 2], [4, 2],
  [3, 2], [2, 3], [3, 4], [3, 5], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8],
  [3, 9], [2, 9], [2, 10], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9],
  [1, 8], [2, 8], [3, 7], [3, 6], [2, 6], [2, 5], [2, 4], [1, 3], [1, 4],
  [1, 5], [1, 6], [2, 7], [3, 8], [4, 9], [5, 8], [5, 7], [5, 6], [6, 7],
  [7, 7], [7, 8], [6, 9], [6, 10], [5, 9], [4, 10], [4, 11], [5, 10],
  [5, 11], [6, 11], [7, 11], [8, 11], [7, 10], [8, 9], [9, 8], [9, 9],
  [10, 10], [11, 11], [11, 10], [11, 9], [11, 8], [11, 7], [10, 8],
  [10, 9], [9, 10], [9, 11], [8, 10], [7, 9], [8, 8], [8, 7], [9, 7],
  [10, 7], [10, 6], [11, 5], [11, 4], [11, 3], [10, 3], [10, 4], [9, 5],
  [8, 5], [8, 4], [7, 3], [7, 4], [7, 5], [7, 6], [8, 6], [9, 6], [10, 5],
  [9, 4], [9, 3], [10, 2],
].map(([r, c]) => makeCellId(r, c));

// SR[i] (i = 0 .. PATH.length-2) says whether PATH[i] and PATH[i+1] lie in
// the same region: true (10) iff some corner covering both is active, false
// (11) otherwise -- including whenever either cell is not covered by any
// active corner at all. Two different active corners can never both cover a
// shared cell (the coverage equation above forbids it), so at most one of
// the shared candidates can be active; this is the same Sum-equation trick
// as `coverage`, just re-targeted at a 2-valued SR cell using codes 10/11
// instead of T's own 1/2 so the pass-sum machine below can tell an SR token
// apart from a digit token by value alone.
const SR_TRUE = 10, SR_FALSE = 11;
const srVar = new Var('SR', 'path step: same region as previous step', PATH.length - 1);
const SR = srVar.cells();
const sameRegion = SR.map((srCell, i) => {
  const shared = coveringAnchors(PATH[i]).filter(a => coveringAnchors(PATH[i + 1]).includes(a));
  if (shared.length === 0) return new Given(srCell, SR_FALSE);
  const window = T.at(shared);
  // sum(window) = 2*k - activeCount, and SR = 11 - activeCount (activeCount
  // is 0 or 1, enforced elsewhere), so sum(window) - SR = 2*k - 11.
  return new Sum(2 * window.length - 11, ...window, [srCell, -1]);
});

// One state machine walks the whole path, alternating an SR token (for
// i >= 1) and the path cell's own digit. State is {acc, X}: acc is the
// running sum of the pass currently open (0 = no open pass), X is the
// common pass total once the first pass has closed (null = not yet known).
//  - An SR token that says "different region" (or acc is already 0) closes
//    any open pass: check it against X (or, if X is still unknown, adopt it
//    as X), then reset acc to 0. An SR token that says "same region" leaves
//    the state alone -- the digit token that follows extends the pass.
//  - A digit token (value 0-9, since SR only ever produces 10/11, the two
//    are never confused) adds to acc. acc is capped at 45 -- the largest a
//    9-cell region's distinct 1-9 digits could ever sum to -- and any step
//    that would exceed it is rejected outright; without that cap the
//    state machine would need to track an unbounded running sum.
//  - accept() closes a still-open final pass the same way transition() does
//    for an internal one, since the path's last cell can end mid-region.
const MAX_PASS_SUM = 45;
const passSumSpec = NFA.encodeSpec({
  startState: { acc: 0, X: null },
  transition: ({ acc, X }, value) => {
    if (value === SR_TRUE || value === SR_FALSE) {
      if (value === SR_FALSE && acc > 0) {
        if (X !== null && acc !== X) return undefined;
        return { acc: 0, X: X === null ? acc : X };
      }
      return { acc, X };
    }
    const newAcc = acc + value;
    if (newAcc > MAX_PASS_SUM) return undefined;
    return { acc: newAcc, X };
  },
  accept: ({ acc, X }) => acc === 0 || X === null || acc === X,
}, geom);

const pathTokens = [PATH[0]];
for (let i = 1; i < PATH.length; i++) {
  pathTokens.push(SR[i - 1], PATH[i]);
}
const linePassSums = new NFA(passSumSpec, 'line pass sums', ...pathTokens);

return [
  shape,
  T.toVar('T'), F.toVar('F'), srVar,
  ...domains, cornerRoom, ...filled,
  ...coverage, regionTotal, ...regionDigits, ...rowsAndColumns,
  ...sameRegion, linePassSums,
];
