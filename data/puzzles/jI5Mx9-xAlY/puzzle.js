// Title: The 10/10 Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=jI5Mx9-xAlY
// Source: https://cracking-the-cryptic.web.app/sudoku/Jqt2g8rMNr
//
// Normal sudoku, no givens.
//
// For every row, label the digit in its 1st cell (from the left) A and its
// 2nd cell B; likewise for every column, reading from the top. A white
// outside clue (adjacent to the grid) gives A + B for that row/column. A grey
// outside clue (further out) gives the sum of the digits standing at
// *position* A and *position* B, counted in from that side -- i.e. the
// digits in the A-th and B-th cells of that row/column, not A and B
// themselves. Not every row/column carries a clue on every side.
//
// ValueIndexing(valueCell, controlCell, ...indexedCells) forces valueCell to
// equal indexedCells[controlCell's value - 1]; controlCell is the row/column's
// own A- or B-cell, doubling as the pointer into its own line. Each grey clue
// needs two such lookups (one per label) whose results are then summed to the
// printed total.

const col = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));
const row = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));

// Grey outside clues: [column, clue value], drawn in the margin row further
// from the grid.
const TOP_GREY = [[1, 16], [3, 13], [4, 12], [5, 9], [6, 10], [7, 11], [8, 11]];
// White outside clues: [column, clue value], drawn in the margin row
// adjacent to the grid.
const TOP_WHITE = [[3, 13], [4, 11], [6, 10], [7, 15], [8, 9]];
// Grey outside clues: [row, clue value], drawn in the margin column further
// from the grid.
const LEFT_GREY = [[1, 6], [4, 10], [5, 10], [6, 10], [7, 10], [9, 9]];
// White outside clues: [row, clue value], drawn in the margin column
// adjacent to the grid.
const LEFT_WHITE = [[4, 10], [5, 9], [6, 10], [7, 10], [9, 11]];

const topA = new Var('TA', 'top A lookup', TOP_GREY.length);
const topB = new Var('TB', 'top B lookup', TOP_GREY.length);
const leftA = new Var('LA', 'left A lookup', LEFT_GREY.length);
const leftB = new Var('LB', 'left B lookup', LEFT_GREY.length);

const topGreySums = TOP_GREY.flatMap(([c, target], i) => {
  const cells = col(c);
  const a = topA.cell(i + 1);
  const b = topB.cell(i + 1);
  return [
    new ValueIndexing(a, makeCellId(1, c), ...cells), // a = digit at position A_c
    new ValueIndexing(b, makeCellId(2, c), ...cells), // b = digit at position B_c
    new Sum(target, a, b),
  ];
});
const topWhiteSums = TOP_WHITE.map(([c, target]) =>
  new Sum(target, makeCellId(1, c), makeCellId(2, c)));

const leftGreySums = LEFT_GREY.flatMap(([r, target], i) => {
  const cells = row(r);
  const a = leftA.cell(i + 1);
  const b = leftB.cell(i + 1);
  return [
    new ValueIndexing(a, makeCellId(r, 1), ...cells), // a = digit at position A_r
    new ValueIndexing(b, makeCellId(r, 2), ...cells), // b = digit at position B_r
    new Sum(target, a, b),
  ];
});
const leftWhiteSums = LEFT_WHITE.map(([r, target]) =>
  new Sum(target, makeCellId(r, 1), makeCellId(r, 2)));

return [
  new Shape('9x9'),
  topA, topB, leftA, leftB,
  ...topGreySums,
  ...topWhiteSums,
  ...leftGreySums,
  ...leftWhiteSums,
];
