// Title: Kakuro Kropki 2
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=CvYlpGLq4-E
// Source: https://app.crackingthecryptic.com/sudoku/9pnq68nq6m

// Rules: "Enter a single digit from 1 to 9 into each white cell so that the
// sum of digits in each Across entry equals the value in grey to the left
// of the entry (if given), and the sum of digits in each Down entry equals
// the value in grey above the entry (if given). No digit may be repeated
// within a single entry. A white circle between two cells shows that the
// digits in those cells are consecutive (i.e., they differ by 1). A black
// circle shows that the digit in one of the cells has twice the value of
// the other. If there is no circle between adjacent cells, neither of these
// properties holds."
//
// This is a Kakuro: each maximal run of white cells between grey cells (or
// the grid edge) is all-different, and where a grey cell prints a total for
// a direction ("if given"), that run also sums to it -- an unprinted run
// gets AllDifferent only, per the rules' own "if given". The grid is `Raw`
// (no implicit row/column/box rules): entries, not rows or columns, are the
// all-different scope. The value range is widened to 0-9 so grey cells can
// hold a blank marker 0; white cells are restricted back to 1-9.
//
// The rules' final sentence is a global negative Kropki rule: every
// orthogonally-adjacent pair of white cells that carries no drawn dot is
// neither consecutive nor 2:1. `StrictKropki` cannot express this, because
// it fires over *every* grid-adjacent pair (including grey-grey and
// grey-white pairs), and a grey-grey pair's shared blank value 0 trivially
// satisfies its ratio clause (0 == 2*0), making the whole encoding
// unsatisfiable. So the negative is built by hand below, scoped to only the
// white-white adjacent pairs, with the drawn dots subtracted out.

// Transcribed from the payload's grey underlays (grid layout) and the
// numeric grey overlays (the 13 printed totals, positioned in a cell's
// upper-right or lower-left triangle by pixel offset, per the rules'
// "top right"/"bottom left"-style convention for Kakuro clue boxes).
// Row by row R1C1..R10C10. '#' = grey, no run either direction; '.' = white;
// 'R<n>'/'D<n>' = grey with a rightward/downward printed total; a bare 'R'
// or 'D' with no digits = grey with a run in that direction but no printed
// total (AllDifferent only, per "if given"); a cell may carry both.
const ROWS = [
  ['#',   'D',   'D',   '#',   'D',   'D',   '#',   'D',   'D12', 'D16'],
  ['R',   '.',   '.',   'R15', '.',   '.',   'R17D', '.',  '.',   '.'  ],
  ['R12', '.',   '.',   'R15D', '.',  '.',   '.',    'RD18', '.', '.' ],
  ['R',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '.' ],
  ['#',   'R21D13', '.', '.',  '.',   'RD',  '.',   '.',   'D32', 'D10'],
  ['R',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '.' ],
  ['R',   '.',   '.',   'R13D', '.',  '.',   '.',   'RD',  '.',   '.' ],
  ['R',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '.' ],
  ['#',   'R17', '.',   '.',   '.',   'RD',  '.',   '.',   '.',   '#' ],
  ['#',   'R',   '.',   '.',   '.',   '.',   '.',   '.',   '.',   '#' ],
];

// The 14 drawn Kropki dots, transcribed from the payload's edge-centred
// overlay circles (backgroundColor #000000 = black/ratio, #FFFFFF =
// white/consecutive), as [row, col] pairs -- a grid dimension of 10 needs
// `makeCellId`'s base-17 digit for column/row 10, so cell ids are built via
// `cellAt` below rather than hand-written as `R#C#` strings.
const BLACK_DOT_COORDS = [
  [[8, 2], [8, 3]],
  [[9, 7], [9, 8]],
];
const WHITE_DOT_COORDS = [
  [[2, 2], [2, 3]],
  [[3, 6], [3, 7]],
  [[2, 9], [3, 9]],
  [[2, 10], [3, 10]],
  [[5, 8], [6, 8]],
  [[5, 3], [5, 4]],
  [[7, 6], [7, 7]],
  [[8, 6], [8, 7]],
  [[9, 3], [9, 4]],
  [[10, 7], [10, 8]],
  [[9, 9], [10, 9]],
  [[7, 10], [8, 10]],
];

const BLANK = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const N = 10;

const shape = new Shape('10x10', '0-9', 'Raw');
const graph = cellGraph(shape);
const origin = graph.cells()[0]; // R1C1, used only as the Replicate shift anchor

const tokenAt = (r, c) => ROWS[r - 1][c - 1];
const cellAt = (r, c) => makeCellId(r, c);
const isGrey = (r, c) => tokenAt(r, c) !== '.';
const totalOf = (r, c, letter) => {
  const m = tokenAt(r, c).match(new RegExp(letter + '(\\d+)'));
  return m ? Number(m[1]) : null;
};
const hasRun = (r, c, letter) => tokenAt(r, c).includes(letter);

const greyCells = [];
const whiteCells = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    (isGrey(r, c) ? greyCells : whiteCells).push(cellAt(r, c));
  }
}

// Blank marker on grey cells; true digit range on white cells. Both are one
// shifted template Given, replicated onto every cell of that colour.
const domains = [
  graph.makeReplicate(new Given(origin, BLANK), greyCells),
  graph.makeReplicate(new Given(origin, ...DIGITS), whiteCells),
];

// Walk from just after a grey cell in one direction until the next grey
// cell or the grid edge, collecting the run's white cells.
const runCells = (r, c, dr, dc) => {
  const cells = [];
  let rr = r + dr, cc = c + dc;
  while (rr >= 1 && rr <= N && cc >= 1 && cc <= N && !isGrey(rr, cc)) {
    cells.push(cellAt(rr, cc));
    rr += dr; cc += dc;
  }
  return cells;
};

// One run per direction per grey cell that has one: all-different always,
// plus a Sum when that grey cell prints a total for the direction ("if
// given" -- an unprinted run of length > 1 is still all-different only).
const runConstraints = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    if (!isGrey(r, c)) continue;
    for (const [dr, dc, letter] of [[0, 1, 'R'], [1, 0, 'D']]) {
      if (!hasRun(r, c, letter)) continue;
      const cells = runCells(r, c, dr, dc);
      if (cells.length > 1) runConstraints.push(new AllDifferent(...cells));
      const total = totalOf(r, c, letter);
      if (total !== null) runConstraints.push(new Sum(total, ...cells));
    }
  }
}

// Kropki dots: drawn pairs get their marked relation.
const BLACK_DOTS = BLACK_DOT_COORDS.map(([[r1, c1], [r2, c2]]) => [cellAt(r1, c1), cellAt(r2, c2)]);
const WHITE_DOTS = WHITE_DOT_COORDS.map(([[r1, c1], [r2, c2]]) => [cellAt(r1, c1), cellAt(r2, c2)]);
const dotConstraints = [
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
];

// The negative half of the rule: every white-white orthogonally-adjacent
// pair that carries no drawn dot is neither consecutive nor 2:1 -- computed
// from the drawn grid and dot lists above, not hand-enumerated (StrictKropki
// does not apply here; see the header comment).
const dotKey = ([a, b]) => a < b ? `${a}|${b}` : `${b}|${a}`;
const dottedPairs = new Set([...BLACK_DOTS, ...WHITE_DOTS].map(dotKey));
const notKropkiKey = Pair.fnToKey(
  (a, b) => a !== b * 2 && b !== a * 2 && Math.abs(a - b) !== 1, shape);

const negativePairs = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    if (isGrey(r, c)) continue;
    if (c + 1 <= N && !isGrey(r, c + 1)) negativePairs.push([cellAt(r, c), cellAt(r, c + 1)]);
    if (r + 1 <= N && !isGrey(r + 1, c)) negativePairs.push([cellAt(r, c), cellAt(r + 1, c)]);
  }
}
const noDotConstraints = negativePairs
  .filter(p => !dottedPairs.has(dotKey(p)))
  .map(([a, b]) => new Pair(notKropkiKey, 'no-dot', a, b));

return [
  shape,
  ...domains,
  ...runConstraints,
  ...dotConstraints,
  ...noDotConstraints,
];
