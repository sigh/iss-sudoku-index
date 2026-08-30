// Title: The BEST X-Sums Sudoku I've Ever Seen
// Author: Tom Collyer
// Video: https://www.youtube.com/watch?v=fnCzYnsC4Ow
// Source: https://cracking-the-cryptic.web.app/sudoku/PtjJbFhttP

// Standard sudoku: every row, column and marked 3x3 box holds 1-9 once, no
// givens. Each outside clue is an X-Sum: the sum of the first X digits read
// into the grid from that clue's side, where X is the value of the first of
// those digits. Column 6 has a top clue only (no bottom clue drawn); every
// other clued lane carries clues on both ends. Clue values transcribed from
// the source's outside overlay text.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Outside-clue lane cell lists, nearest-clue-first (required for XSum's
// "first X digits from that direction" reading).
const topCol = (col) => graph.column(col);
const bottomCol = (col) => graph.column(col).slice().reverse();
const leftRow = (row) => graph.row(row);
const rightRow = (row) => graph.row(row).slice().reverse();

return [
  new Shape('9x9'),

  // Column clues.
  XSum.fromCells(27, topCol(2), geometry),
  XSum.fromCells(27, bottomCol(2), geometry),
  XSum.fromCells(11, topCol(4), geometry),
  XSum.fromCells(11, bottomCol(4), geometry),
  XSum.fromCells(21, topCol(6), geometry),
  XSum.fromCells(16, topCol(7), geometry),
  XSum.fromCells(16, bottomCol(7), geometry),

  // Row clues.
  XSum.fromCells(8, leftRow(2), geometry),
  XSum.fromCells(8, rightRow(2), geometry),
  XSum.fromCells(17, leftRow(4), geometry),
  XSum.fromCells(17, rightRow(4), geometry),
  XSum.fromCells(30, leftRow(6), geometry),
  XSum.fromCells(30, rightRow(6), geometry),
  XSum.fromCells(28, leftRow(8), geometry),
  XSum.fromCells(28, rightRow(8), geometry),
];
