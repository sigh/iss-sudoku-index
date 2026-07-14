// Title: Battle Line
// Author: DiMono
// Video: https://www.youtube.com/watch?v=j_i2d_ydgf4
// Source: https://sudokupad.app/jn8oxp9vmp

// Normal sudoku rules apply.
//
// Battlefield: for each row and column, let X be the digit in its first cell
// and Y the digit in its last cell. Consider the first X cells and the last Y
// cells of that row/column (both counted from the row/column's own ends).
// These two spans either overlap (when X+Y>9, over positions (10-Y)..X) or
// leave a gap (when X+Y<9, over positions (X+1)..(9-Y)); when X+Y==9 the spans
// meet exactly, with neither an overlap nor a gap. Outside clues give the sum
// of the resulting overlap/gap cells for five lines (rows 3,4,6 and
// columns 3,6).
//
// A cell that is an overlap cell for BOTH its row and its column is red; a
// cell that is a gap cell for BOTH its row and its column is green. The
// puzzle pre-shades every such cell (2 red, 5 green): "ALL cells with the
// property are shaded" is read as an exhaustive given fact about the solved
// grid, so it is encoded both ways -- shaded cells must have the property,
// and all other cells must not.

const N = 9;

const rowCells = r => Array.from({ length: N }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: N }, (_, i) => makeCellId(i + 1, c));

// [row-or-column number (1-indexed), outside sum] -- read as the overlay text
// at the border, e.g. the left clue "26" against row 3.
const rowClues = [[3, 26], [4, 9], [6, 21]];
const colClues = [[3, 15], [6, 22]];

// Inclusive 1-indexed [from, to] range as an array, or [] if from > to.
const rangeArr = (from, to) => {
  const out = [];
  for (let v = from; v <= to; v++) out.push(v);
  return out;
};

// The overlap ('from'..'to' with sign '+') or gap (sign '-') position range
// for a line whose first/last cell digits are x/y, or null when x+y==N
// (spans meet exactly; no overlap, no gap).
const battlefieldRange = (x, y) => {
  if (x + y > N) return { from: N + 1 - y, to: x };
  if (x + y < N) return { from: x + 1, to: N - y };
  return null;
};

// One outside-sum clue: an Or over every (x, y) digit pair for the line's
// first/last cells that yields a non-empty region, each branch pinning those
// two cells and requiring the resulting region to sum to `sum`.
const battlefieldSumClue = (cells, sum) => {
  const branches = [];
  for (let x = 1; x <= N; x++) {
    for (let y = 1; y <= N; y++) {
      const range = battlefieldRange(x, y);
      if (range === null) continue;
      const region = cells.slice(range.from - 1, range.to);
      branches.push(new And([
        new Given(cells[0], x),
        new Given(cells[N - 1], y),
        new Sum(sum, ...region),
      ]));
    }
  }
  return new Or(branches);
};

const battlefieldSumClues = [
  ...rowClues.map(([r, sum]) => battlefieldSumClue(rowCells(r), sum)),
  ...colClues.map(([c, sum]) => battlefieldSumClue(colCells(c), sum)),
];

// Shading given in the raw puzzle: red = overlap-in-both, green = gap-in-both.
// Cell coordinates are 1-indexed [row, col].
const redCells = [[3, 8], [9, 2]];
const greenCells = [[4, 7], [5, 6], [6, 5], [7, 4], [8, 3]];

const isFullRange = r => r.length === N;

// Force cell (r, c) to be an overlap cell for both its row and its column:
// rowFirst>=c, rowLast>=10-c, colFirst>=r, colLast>=10-r.
const forceOverlapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  return [
    [rowFirst, rangeArr(c, N)],
    [rowLast, rangeArr(N + 1 - c, N)],
    [colFirst, rangeArr(r, N)],
    [colLast, rangeArr(N + 1 - r, N)],
  ]
    .filter(([, values]) => !isFullRange(values))
    .map(([cell, values]) => new Given(cell, ...values));
};

// Force cell (r, c) to be a gap cell for both its row and its column:
// rowFirst<=c-1, rowLast<=9-c, colFirst<=r-1, colLast<=9-r.
const forceGapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  return [
    [rowFirst, rangeArr(1, c - 1)],
    [rowLast, rangeArr(1, N - c)],
    [colFirst, rangeArr(1, r - 1)],
    [colLast, rangeArr(1, N - r)],
  ]
    .filter(([, values]) => !isFullRange(values))
    .map(([cell, values]) => {
      if (values.length === 0) {
        throw new Error(`forceGapBoth(${r},${c}): impossible border cell`);
      }
      return new Given(cell, ...values);
    });
};

// Or-of-Givens for "NOT overlap-in-both" / "NOT gap-in-both" at (r, c).
// Each branch negates one of the four conditions above; a branch whose
// negated range would be the full 1..9 domain means the property is already
// geometrically impossible there, so the whole Or is omitted (vacuously true).
const notOverlapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  const branches = [
    [rowFirst, rangeArr(1, c - 1)],
    [rowLast, rangeArr(1, N - c)],
    [colFirst, rangeArr(1, r - 1)],
    [colLast, rangeArr(1, N - r)],
  ].filter(([, values]) => values.length > 0);
  return new Or(branches.map(([cell, values]) => new Given(cell, ...values)));
};

const notGapBoth = (r, c) => {
  const rowFirst = makeCellId(r, 1), rowLast = makeCellId(r, N);
  const colFirst = makeCellId(1, c), colLast = makeCellId(N, c);
  const branches = [
    [rowFirst, rangeArr(c, N)],
    [rowLast, rangeArr(N + 1 - c, N)],
    [colFirst, rangeArr(r, N)],
    [colLast, rangeArr(N + 1 - r, N)],
  ];
  // If any single branch's range is the full 1..N domain, that disjunct is
  // unconditionally true, so the whole Or is trivially satisfied -- omit the
  // constraint entirely rather than dropping just that branch (which would
  // silently keep only the remaining, insufficient branches and over-constrain
  // the boundary row/column).
  if (branches.some(([, values]) => isFullRange(values))) return null;
  return new Or(branches.map(([cell, values]) => new Given(cell, ...values)));
};

const shadingConstraints = [];
for (let r = 1; r <= N; r++) {
  for (let c = 1; c <= N; c++) {
    const isRed = redCells.some(([rr, rc]) => rr === r && rc === c);
    const isGreen = greenCells.some(([gr, gc]) => gr === r && gc === c);
    if (isRed) {
      shadingConstraints.push(...forceOverlapBoth(r, c));
    } else if (isGreen) {
      shadingConstraints.push(...forceGapBoth(r, c));
    } else {
      shadingConstraints.push(notOverlapBoth(r, c));
      const notGap = notGapBoth(r, c);
      if (notGap !== null) shadingConstraints.push(notGap);
    }
  }
}

return [
  new Shape('9x9'),
  ...battlefieldSumClues,
  ...shadingConstraints,
];
