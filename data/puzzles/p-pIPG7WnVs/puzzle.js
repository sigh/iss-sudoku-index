// Title: Smallhat
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=p-pIPG7WnVs
// Source: https://tinyurl.com/ysuszmhy

// Rules encoded here:
//  1. Nine non-overlapping 3x3 regions are placed in an 11x11 grid, each
//     holding the digits 1-9 once; cells outside every region stay empty.
//  2. No digit repeats in a row or column (over whichever cells of that row
//     or column are inside a region).
//  3. Each pink line is a renban: the region-covered cells on it (cells
//     outside any region contribute nothing, per rule 1) hold a set of
//     consecutive digits with no repeats, in any order; a line with no
//     region-covered cells is vacuously satisfied.
//  4. A circled cell always lies inside a region (every circle contains a
//     digit). Its digit equals how many cells of one particular pink line
//     lie in that same region, counting the circled cell's own cell (it is
//     both "from its region" and "on the line").
// Every rule above is encoded below. Rule 4's precise reading (which line a
// circle counts, and whether it counts its own cell) is the most textually
// faithful one found, but is not independently certified.
//
// The 11x11 canvas is Raw, not a default Sudoku-type main grid: a default
// grid's row is always all-different, while here a row holds at most one of
// each digit and any number of empty cells. Every rule is stated explicitly;
// main grid cells hold 1-9 = the digit, 0 = no digit (outside every region).

const shape = new Shape('11x11', '0-10', 'Raw');
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();

const T = grid.makeOverlay('VT');  // 1 = a region has its top-left corner here, 2 = no
const F = grid.makeOverlay('VF');  // 1 = this cell lies inside a region, 2 = no

const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

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

// A cell is inside a region exactly when one region corner sits in the 3x3
// window that ends at it, and no more than one may: this single equation is
// both "the regions tile the filled cells" and "the regions do not overlap".
const coverage = cells.map(cell => {
  const window = [];
  for (let dRow = -2; dRow <= 0; dRow++) for (let dCol = -2; dCol <= 0; dCol++) {
    const corner = grid.step(cell, dRow, dCol);
    if (corner !== null) window.push(T.at(corner));
  }
  return window.length === 1
    ? new SameValues(2, window[0], F.at(cell))
    : new Sum(2 * window.length - 2, ...window, [F.at(cell), -1]);
});

// A cell holds a digit exactly when it is inside a region (F = 1); a cell
// outside every region (F = 2) holds no digit.
const filledKey = Pair.fnToKey((d, f) => (d !== BLANK) === (f === 1), geom);
const filled = cells.map(cell => new Pair(filledKey, 'filled', cell, F.at(cell)));

// Nine regions of nine cells fill 81 of the 121 cells.
const regionTotal = new Sum(2 * cells.length - 81, ...F.cells());

// Where a region does start, its nine cells are all different; every cell of
// a started region is filled, so all-different over 1-9 is "digits 1-9 once".
const regionDigits = cells
  .filter(cell => grid.block(cell, 3, 3) !== null)
  .map(cell => new Or([
    new Given(T.at(cell), 2),
    new AllDifferent(...grid.block(cell, 3, 3)),
  ]));

// Rows and columns hold at most one of each digit; blanks may repeat, which
// no AllDifferent can say, so the pairwise relation states it directly. The
// same relation also governs "no repeats" along a pink line (below): a line
// can revisit a row/column or cross between regions, so its own no-repeat
// clause is independent of the row/column ones.
const noRepeatKey = PairX.fnToKey((a, b) => a !== b || a === BLANK, geom);
const rowsAndColumns = [...grid.rows(), ...grid.columns()].map(
  house => new PairX(noRepeatKey, 'no-repeat', ...house));

// The 15 distinct drawn pink-line cell paths, deduplicated: three pairs of
// drawn entries are the exact same set of cells and are kept once, since a
// renban's meaning depends only on its cell set. Cell ids are built through
// makeCellId (not written as 'R#C#' literals): its canonical single-char
// encoding runs 1-9 then a, b, ... for row/col 10, 11, so literal two-digit
// ids like 'R6C10' are not valid cell ids at all in this grid.
const RC = (r, c) => makeCellId(r, c);
const LINES = [
  [[6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 10], [11, 9], [11, 8], [11, 7], [11, 6]],
  [[9, 10], [10, 10], [10, 9]],
  [[6, 10], [6, 9], [6, 8], [7, 9]],
  [[10, 2], [10, 3], [9, 3], [8, 3], [8, 4], [8, 5], [7, 5], [6, 5], [5, 5], [5, 6], [6, 6], [7, 6], [7, 7], [6, 7], [5, 7], [4, 7], [4, 8], [4, 9], [3, 9], [2, 9], [2, 10]],
  [[2, 7], [2, 6], [3, 6], [4, 6], [4, 5], [4, 4], [5, 4], [6, 4], [6, 3], [6, 2], [7, 2]],
  [[3, 2], [4, 3], [3, 3], [3, 4], [2, 3]],
  [[8, 6], [9, 6], [10, 6], [9, 7]],
  [[3, 4], [2, 3], [2, 2], [3, 2], [4, 3]],
  [[8, 6], [9, 7], [10, 6]],
  [[6, 8], [7, 9], [6, 10]],
  [[8, 9], [8, 8], [9, 8], [9, 9]],
  [[1, 8], [2, 8]],
  [[8, 1], [8, 2]],
  [[11, 3], [10, 4], [11, 5]],
  [[3, 11], [4, 10], [5, 11]],
].map(line => line.map(([r, c]) => RC(r, c)));

// Renban: the region-covered (non-BLANK) cells on the line hold a
// consecutive set with no repeats. Scan the running (min, max, count) over
// non-blank values only, ignoring order (a set property, so the cells can be
// scanned in any order); count clamps at 10 so the state stays bounded on
// the 21-cell line (a real region-digit run can never reach 10, so the clamp
// never lets a bad run sneak through as an accept).
const renbanSpec = NFA.encodeSpec({
  startState: { min: BLANK, max: BLANK, count: 0 },
  transition: ({ min, max, count }, value) => {
    if (value === BLANK) return { min, max, count };
    return {
      min: min === BLANK ? value : Math.min(min, value),
      max: max === BLANK ? value : Math.max(max, value),
      count: Math.min(count + 1, 10),
    };
  },
  accept: ({ min, max, count }) => count === 0 || max - min + 1 === count,
}, geom);
const renbans = LINES.map((line, i) => new NFA(renbanSpec, `renban${i}`, ...line));
// No-repeat along each line is independent of the row/column relation above
// (a line is not a row, column, or region), so it is stated per line too.
const lineNoRepeat = LINES.map(line => new PairX(noRepeatKey, 'no-repeat-line', ...line));

// The nine drawn circled cells, each paired with whichever line above
// contains it (unique per circle, checked at generation via the `find`
// below erroring on a miss).
const CIRCLES = ['R9C9', 'R6C9', 'R3C9', 'R3C6', 'R3C3', 'R6C3', 'R9C3', 'R9C6', 'R6C6'];
const circleLine = new Map(CIRCLES.map(circle => {
  const line = LINES.find(l => l.includes(circle));
  if (!line) throw new Error(`No pink line found for circle ${circle}`);
  return [circle, line];
}));

// Every circle contains a digit: it always lies inside a region.
const circleGivens = CIRCLES.map(circle => new Given(F.at(circle), 1));

// Corners whose 3x3 window could cover both `a` and `b` -- the only corners
// relevant to whether they end up in the same region. A window covering both
// needs its corner's row in [max(a.row,b.row)-2, min(a.row,b.row)], and
// likewise for columns; `validCorners` then drops any window that would run
// off the grid.
const validCorners = new Set(cells.filter(cell => grid.block(cell, 3, 3) !== null));
const candidateCorners = (a, b) => {
  const A = parseCellId(a), B = parseCellId(b);
  const corners = [];
  const r0Min = Math.max(1, Math.max(A.row, B.row) - 2);
  const r0Max = Math.min(11, Math.min(A.row, B.row));
  const c0Min = Math.max(1, Math.max(A.col, B.col) - 2);
  const c0Max = Math.min(11, Math.min(A.col, B.col));
  for (let r0 = r0Min; r0 <= r0Max; r0++) {
    for (let c0 = c0Min; c0 <= c0Max; c0++) {
      const corner = makeCellId(r0, c0);
      if (validCorners.has(corner)) corners.push(corner);
    }
  }
  return corners;
};

// One same-region flag per (circle, other line cell) pair that could
// possibly land in the circle's region -- a cell too far away never can, and
// is simply left out of the count below.
const srPairs = [];
for (const circle of CIRCLES) {
  for (const cell of circleLine.get(circle)) {
    if (cell === circle) continue;
    const corners = candidateCorners(circle, cell);
    if (corners.length) srPairs.push({ circle, cell, corners });
  }
}
const SR = new Var('SR', 'same region as circle', srPairs.length);
const srCells = SR.cells();
const srDomains = srCells.map(cell => new Given(cell, 1, 2));

// SR = 1 (same region) exactly when one of the candidate corners is the
// active one (T = 1); the coverage equations above already forbid two
// candidate corners both being active, since both windows cover the circle
// cell, so this sum can only land on "no corner active" (SR = 2) or "exactly
// one, and it is the shared one" (SR = 1). With a single candidate corner the
// equation is a direct equality.
const sameRegion = srPairs.map(({ corners }, i) => corners.length === 1
  ? new SameValues(2, srCells[i], T.at(corners[0]))
  : new Sum(
    2 - 2 * corners.length,
    [srCells[i], 1],
    ...corners.map(corner => [T.at(corner), -1]),
  ));

// The circled digit is the count of same-region cells on its line, plus one
// for the circle's own cell (always in its own region).
const circleCounts = CIRCLES.map(circle => {
  const terms = srPairs
    .map((pair, i) => ({ pair, sr: srCells[i] }))
    .filter(({ pair }) => pair.circle === circle);
  return new Sum(1 + 2 * terms.length, circle, ...terms.map(({ sr }) => sr));
});

return [
  shape,
  new Given('R2C4', 9), new Given('R4C2', 8),
  T.toVar('T'), F.toVar('F'), SR,
  ...domains, ...srDomains,
  cornerRoom,
  ...coverage, ...filled, regionTotal, ...regionDigits, ...rowsAndColumns,
  ...renbans, ...lineNoRepeat,
  ...circleGivens, ...sameRegion, ...circleCounts,
];
