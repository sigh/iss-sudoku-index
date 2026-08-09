// Title: Mondrian's Revenge
// Author: Juho Snellman
// Video: https://www.youtube.com/watch?v=pGPuqmK0WtE
// Source: https://sudokupad.app/xh8xv5itva

// Rules encoded here:
//  1. Nine non-overlapping 3x3 boxes are placed in an 11x11 grid. Each box holds
//     the digits 1-9. Cells outside every box stay empty.
//  2. Digits may not repeat in a box, a row, or a column.
//  3. A straight vertical or horizontal line is drawn through each circle. Lines
//     may not overlap, and each line carries exactly one circle. The digit in a
//     circle is the length in cells of the line through it (length 1 does not
//     leave the circle's own cell).
//  4. No two of the digits 1-9 appear in circles the same number of times; at
//     most one digit appears zero times.
//  5. A white dot joins consecutive digits; a black dot joins a digit and its
//     double. Not all possible dots are given, so absent dots say nothing.
// Nothing is omitted.
//
// The 11x11 canvas is Raw, not a default Sudoku-type main grid: a Sudoku main
// grid's row is always all-different, while here a row holds at most one of
// each digit and any number of empty cells. Raw carries no implicit
// constraints, so every rule below is stated explicitly; the main grid cells
// hold 1-9 = the digit in this cell, 0 = no digit.

const shape = new Shape('11x11', '0-10', 'Raw');

// The reference geometry over the same value range. It supplies the rows,
// columns, 3x3 windows and step arithmetic that get translated onto the cell
// groups, and the value count the custom Pair/NFA keys are built for.
const grid = cellGraph(shape);
const geom = grid.gridGeometry();
const cells = grid.cells();

// One aux group per per-cell unknown, all indexed by the reference cell they shadow.
const T = grid.makeOverlay('VT');   // 1 = a 3x3 box has its top-left corner here, 2 = no
const F = grid.makeOverlay('VF');   // 1 = this cell lies inside a box, 2 = no
const L = grid.makeOverlay('VL');   // line code, see below
const C = grid.makeOverlay('VC');   // 1 = this cell lies on a line, 2 = no
const countVar = new Var('N', 'circle digit counts', 9);  // how often digit n is circled
const COUNTS = countVar.cells();

const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// A line is read off its cells: the START cell is its first cell in reading
// order and every later cell is CONT, so two lines that touch end-to-end stay
// distinguishable and two lines that overlap demand a cell be both START and
// CONT, which no single value can be.
const OFF = 1, H_START = 2, H_CONT = 3, V_START = 4, V_CONT = 5;
const LINE_CODES = [OFF, H_START, H_CONT, V_START, V_CONT];

// The 37 drawn circles, read off the grey-bordered circle overlays.
const CIRCLES = [
  [1, 1], [1, 2], [1, 9], [1, 10],
  [2, 3], [2, 5], [2, 7],
  [3, 2], [3, 3], [3, 5], [3, 9],
  [4, 6], [4, 7], [4, 9],
  [5, 1], [5, 6],
  [6, 1], [6, 2], [6, 3], [6, 10],
  [7, 1], [7, 4],
  [8, 4], [8, 11],
  [9, 7], [9, 8], [9, 11],
  [10, 3], [10, 4], [10, 5], [10, 6], [10, 9], [10, 10], [10, 11],
  [11, 6], [11, 7], [11, 8],
].map(([r, c]) => makeCellId(r, c));
const circleSet = new Set(CIRCLES);

// Every cell of a group keeps the same domain across the whole layer. The count
// cells keep the full 0-10 range, which their Sum below already narrows.
const overlayDomain = (overlay, ...values) =>
  overlay.makeReplicate(new Given(overlay.cells()[0], ...values));
const domains = [
  overlayDomain(grid, BLANK, ...DIGITS),
  overlayDomain(T, 1, 2),
  overlayDomain(F, 1, 2),
  overlayDomain(L, ...LINE_CODES),
  overlayDomain(C, 1, 2),
];

// A box corner needs a whole 3x3 block below and right of it.
const cornerRoom = T.makeReplicate(
  new Given(T.cells()[0], 2),
  T.at(cells.filter(cell => grid.block(cell, 3, 3) === null)));

const filledKey = Pair.fnToKey((d, f) => (d !== BLANK) === (f === 1), geom);
const filled = cells.map(cell => new Pair(filledKey, 'filled', cell, F.at(cell)));

// A cell is inside a box exactly when one box corner sits in the 3x3 window that
// ends at it, and no more than one may: that single equation is both "the boxes
// tile the filled cells" and "the boxes do not overlap". Both groups are
// 1 = yes / 2 = no, so a count of yeses over n cells is 2n minus their sum.
const coverage = cells.map(cell => {
  const window = [];
  for (let dRow = -2; dRow <= 0; dRow++) for (let dCol = -2; dCol <= 0; dCol++) {
    const corner = grid.step(cell, dRow, dCol);
    if (corner !== null) window.push(T.at(corner));
  }
  // At R1C1 the window is the cell itself and the equation degenerates to
  // "R1C1 is filled exactly when a box starts there".
  return window.length === 1
    ? new SameValues(2, window[0], F.at(cell))
    : new Sum(2 * window.length - 2, ...window, [F.at(cell), -1]);
});

// Nine boxes of nine cells fill 81 of the 121 cells.
const boxTotal = new Sum(2 * cells.length - 81, ...F.cells());

// Where a box does start, its nine cells are all different; drawn from 1-9
// (every cell of a box is filled) that is the digits 1-9 once each.
const boxDigits = cells
  .filter(cell => grid.block(cell, 3, 3) !== null)
  .map(cell => new Or([
    new Given(T.at(cell), 2),
    new AllDifferent(...grid.block(cell, 3, 3)),
  ]));

// Rows and columns hold at most one of each digit; blanks may repeat, which no
// AllDifferent can say, so the pairwise relation states it directly.
const rowColKey = PairX.fnToKey((a, b) => a !== b || a === BLANK, geom);
const rowsAndColumns = [...grid.rows(), ...grid.columns()].map(
  house => new PairX(rowColKey, 'no-repeat', ...house));

// One Or per circle over every line that could pass through it: pick a length d,
// an orientation and how far back the line starts, then pin the circle's digit to
// d and paint the line's cells. Candidates whose span covers a second circle are
// dropped here, which is the "exactly one circle on each line" clause. The cell
// past the far end is barred from CONT so the line cannot run on beyond d. A
// length-1 line has no orientation, so only its horizontal form is generated.
const lines = CIRCLES.map(circle => {
  const branches = [];
  for (const d of DIGITS) {
    const orientations = d === 1 ? [[0, 1]] : [[0, 1], [1, 0]];
    for (const [dRow, dCol] of orientations) {
      for (let back = 0; back < d; back++) {
        const start = grid.step(circle, -dRow * back, -dCol * back);
        if (start === null) continue;
        const span = [];
        for (let k = 0; k < d; k++) {
          const cell = grid.step(start, dRow * k, dCol * k);
          if (cell === null || (cell !== circle && circleSet.has(cell))) break;
          span.push(cell);
        }
        if (span.length !== d) continue;
        const cont = dRow === 0 ? H_CONT : V_CONT;
        const branch = [
          new Given(circle, d),
          new Given(L.at(start), dRow === 0 ? H_START : V_START),
          ...span.slice(1).map(cell => new Given(L.at(cell), cont)),
        ];
        const beyond = grid.step(span[d - 1], dRow, dCol);
        if (beyond !== null) {
          branch.push(new Given(L.at(beyond), ...LINE_CODES.filter(v => v !== cont)));
        }
        branches.push(new And(branch));
      }
    }
  }
  return new Or(branches);
});

const onLineKey = Pair.fnToKey((l, c) => (l !== OFF) === (c === 1), geom);
const onLine = cells.map(cell => new Pair(onLineKey, 'on-line', L.at(cell), C.at(cell)));

// The lines cover as many cells in total as their lengths add up to, which are the
// circled digits. Each Or already paints its own line and no two lines can share a
// cell, so this is what stops a line being drawn where no circle asked for one.
// VC is 1 = on / 2 = off, so its total is 2*121 minus the number of covered cells.
const lineCellTotal = new Sum(2 * cells.length, ...C.cells(), ...CIRCLES);

// One machine per digit, reading its count cell first and then the 37 circles:
// the count cell sets how many of that digit are still to come, and the run is
// accepted only if the tally lands exactly on zero.
const countSpec = (digit) => NFA.encodeSpec({
  startState: null,
  transition: (remaining, value) => {
    if (remaining === null) return value;
    if (value !== digit) return remaining;
    return remaining === 0 ? undefined : remaining - 1;
  },
  accept: (remaining) => remaining === 0,
}, geom);
const circleCounts = DIGITS.map(
  digit => new NFA(countSpec(digit), `count${digit}`, COUNTS[digit - 1], ...CIRCLES));

// The nine counts are distinct and total the 37 circles. (Nine distinct
// non-negative counts summing to 37 can only be 0..7 and 9 in some order, which
// is why at most one digit is missing from the circles; that is a consequence
// here, not a further constraint.)
const countRules = [
  new AllDifferent(...COUNTS),
  new Sum(CIRCLES.length, ...COUNTS),
];

// The three drawn dots, read off the small edge circles. A dot also tells us both
// of its cells hold digits, which rules out the blank the dot classes would allow.
const blackKey = Pair.fnToKey(
  (a, b) => a !== BLANK && b !== BLANK && (a === 2 * b || b === 2 * a), geom);
const whiteKey = Pair.fnToKey(
  (a, b) => a !== BLANK && b !== BLANK && Math.abs(a - b) === 1, geom);
const dots = [
  new Pair(blackKey, 'black', 'R1C1', 'R2C1'),
  new Pair(whiteKey, 'white', 'R5C8', 'R5C9'),
  new Pair(whiteKey, 'white', 'R7C5', 'R8C5'),
];

return [
  shape,
  T.toVar('T'), F.toVar('F'), L.toVar('L'), C.toVar('C'),
  countVar,
  ...domains, cornerRoom, ...filled,
  ...coverage, boxTotal, ...boxDigits, ...rowsAndColumns,
  ...lines, ...onLine, lineCellTotal,
  ...circleCounts, ...countRules, ...dots,
];
