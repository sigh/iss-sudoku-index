// Title: Ten Triples
// Author: Simon Ferre
// Video: https://www.youtube.com/watch?v=NwHVA2ou-T4
// Source: https://cracking-the-cryptic.web.app/sudoku/M72DgptNmt

// Normal sudoku (default row/column/box all-different) plus:
// - Ten grey 3-cell diagonal lines; each line's three cells must all hold
//   the same digit ("a trio of identical digits").
// - Fourteen outside sums (rows 2-8 on the left, columns 2-8 on the top):
//   each gives the sum of the digits that lines place in that row/column.
//   A diagonal line crosses any row or column it touches exactly once, so
//   this is just a Sum over the specific cells the lines contribute to that
//   row/column (already forced distinct by the row/column all-different).

const givens = [
  new Given('R1C2', 1),
  new Given('R5C2', 3),
  new Given('R8C8', 1),
  new Given('R9C4', 1),
];

// Ten 3-cell diagonal trio lines, transcribed from the payload's `lines`
// array (each a straight diagonal run of 3 cells).
const trioLines = [
  ['R6C8', 'R7C7', 'R8C6'],
  ['R8C7', 'R7C6', 'R6C5'],
  ['R7C5', 'R6C6', 'R5C7'],
  ['R5C6', 'R4C7', 'R3C8'],
  ['R4C8', 'R3C7', 'R2C6'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R2C4', 'R3C3', 'R4C2'],
  ['R3C5', 'R4C4', 'R5C3'],
  ['R5C4', 'R6C3', 'R7C2'],
  ['R6C2', 'R7C3', 'R8C4'],
];

// Each trio line forces its 3 cells to the same digit: SameValues with
// numSets == cells.length treats every cell as its own singleton set, so
// "each set holds the same values" collapses to "all cells equal".
const trios = trioLines.map(
  cells => new SameValues(cells.length, ...cells));

// Outside sums, transcribed from the payload's overlays (nearest-grid-first
// reading of each outside-clue lane). Cells are the ones a trioLines member
// contributes to that row/column, derived from trioLines above rather than
// re-listed by hand.
const rowSums = { 2: 17, 3: 25, 4: 25, 5: 25, 6: 30, 7: 30, 8: 13 };
const colSums = { 2: 24, 3: 29, 4: 29, 5: 18, 6: 26, 7: 26, 8: 13 };

const cellRow = cell => parseCellId(cell).row;
const cellCol = cell => parseCellId(cell).col;
const allLineCells = trioLines.flat();

const rowOutsideSums = Object.entries(rowSums).map(([row, total]) =>
  new Sum(total, ...allLineCells.filter(c => cellRow(c) === +row)));
const colOutsideSums = Object.entries(colSums).map(([col, total]) =>
  new Sum(total, ...allLineCells.filter(c => cellCol(c) === +col)));

return [
  new Shape('9x9'),
  ...givens,
  ...trios,
  ...rowOutsideSums,
  ...colOutsideSums,
];
