// Title: Between The Edges
// Author: Jodawo
// Video: https://www.youtube.com/watch?v=lF8OXvP_7OI
// Source: https://sudokupad.app/3ucqlappvo

// Normal sudoku rules apply.
//
// Black Kropki dot: adjacent cells in a 1:2 ratio. Only one dot is drawn, and
// the rules say not all Kropki dots are given, so no negative ("no other
// ratio exists") constraint is added -- BlackDot is placed only at the one
// drawn location.
//
// Circled cells: each circled cell's digit must be strictly between the
// digits at the two ends of its own row (the row's leftmost and rightmost
// cell), whichever end is larger. Green-shaded cells: the same rule, keyed
// on the top and bottom cell of the shaded cell's own column. Both are
// encoded with the native Between constraint as a 3-cell [end, target, end]
// call -- Between only requires its middle cell(s) to sit strictly between
// its first and last cell's values and has no adjacency requirement, so a
// single middle cell expresses exactly "this cell, between these two
// row/column-edge cells."
//
// "(All Circles and Green Shaded Cells given)" is a completeness qualifier,
// not a transcription footnote: it is the deliberate counterpart to the
// Kropki clause's "Not all Kropki Dots are given" two sentences earlier --
// one clue type is explicitly exhaustive, the other explicitly is not. For
// the exhaustive types this makes the mark's absence meaningful: every cell
// NOT circled must NOT sit between its row's edges, and every cell NOT
// green-shaded must NOT sit between its column's edges. Encoded with the
// native Lockout constraint (minDiff=1, trivially true since same-row/
// column cells already differ) whose mids are "locked out" of the open
// interval between its ends -- exactly the negation of Between.

// Circled cells by row and green-shaded cells by column, transcribed from
// the drawn `circle` and shaded-`grid` (#60D060) geometry.
const circleCellsByRow = {
  1: [2, 4, 5, 6, 7],
  2: [2, 3, 5, 6],
  4: [3, 4, 7, 8],
  5: [2, 3, 4, 5, 6, 7, 8],
  6: [4],
  7: [2, 5, 6, 8],
  9: [2, 4, 5, 6, 7, 8],
};
const greenCellsByCol = {
  3: [2, 3, 4, 5, 6, 8],
  5: [2, 3, 5, 6, 7],
  8: [3, 4, 6, 7, 8],
  9: [7],
};

const graph = cellGraph('9x9');

const rowBetweens = Object.entries(circleCellsByRow).flatMap(([r, cols]) => {
  const row = graph.row(Number(r));
  return cols.map(c => new Between(row[0], row[c - 1], row[8]));
});

const colBetweens = Object.entries(greenCellsByCol).flatMap(([c, rows]) => {
  const col = graph.column(Number(c));
  return rows.map(r => new Between(col[0], col[r - 1], col[8]));
});

// Negative counterpart of rowBetweens/colBetweens: every interior cell (col
// or row 2-8) not on the marked list for its row/column is locked out of
// that row's/column's open between-interval.
const interior = [2, 3, 4, 5, 6, 7, 8];
const rowLockouts = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(r => {
  const row = graph.row(r);
  const marked = new Set(circleCellsByRow[r] || []);
  const mids = interior.filter(c => !marked.has(c)).map(c => row[c - 1]);
  return mids.length ? [new Lockout(1, row[0], ...mids, row[8])] : [];
});
const colLockouts = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap(c => {
  const col = graph.column(c);
  const marked = new Set(greenCellsByCol[c] || []);
  const mids = interior.filter(r => !marked.has(r)).map(r => col[r - 1]);
  return mids.length ? [new Lockout(1, col[0], ...mids, col[8])] : [];
});

return [
  new Shape('9x9'),
  new BlackDot('R6C1', 'R6C2'),
  ...rowBetweens,
  ...colBetweens,
  ...rowLockouts,
  ...colLockouts,
];
