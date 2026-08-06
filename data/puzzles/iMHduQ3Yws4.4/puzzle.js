// Title: June 13, 2023: Roll Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=iMHduQ3Yws4
// Source: https://tinyurl.com/2utu2tv3

// Two overlapping 9x9 classic sudoku grids on a 12-row x 9-column canvas: the
// top grid is rows 1-9, the bottom grid is rows 4-12, and rows 4-9 are the
// same physical cells read by both grids. An ISS main grid can't hold this:
// its automatic column all-different would force 12 cells in one column to
// be pairwise distinct, impossible with only 9 values. So the whole board is
// one Var group (VB) instead, addressed row/column via its declared 12x9
// dimensions, with every row/column/box all-different added explicitly.
const board = new Var('B', 'board', '12x9');
const cellAt = (row, col) => board.cell(row, col);
const boardLayout = cellGraph('12x9').makeOverlay('VB');

// Physical rows: every row is 9 cells regardless of which grid(s) it
// belongs to, so one all-different per row (1-12) covers both grids' row
// rules.
const rows = Array.from({ length: 12 }, (_, i) => {
  const row = i + 1;
  return new AllDifferent(...Array.from({ length: 9 }, (_, c) => cellAt(row, c + 1)));
});

// Columns: the two grids' column windows (rows 1-9, rows 4-12) differ, so
// both need their own all-different per column.
const columnWindows = [1, 4];   // window start row for the top / bottom grid
const columns = columnWindows.flatMap(startRow =>
  Array.from({ length: 9 }, (_, i) => {
    const col = i + 1;
    return new AllDifferent(...Array.from({ length: 9 }, (_, r) => cellAt(startRow + r, col)));
  }));

// Boxes: the 12x9 board layout tiles into the twelve 3x3 boxes needed by the
// two overlapping grids. Box-rows 4-6 and 7-9 are shared, so each physical
// box appears exactly once.
const boxes = boardLayout.boxes(9).map(cells => new AllDifferent(...cells));

// Givens, transcribed from the source's per-cell digits.
const givens = [
  [1, 1, 1], [1, 4, 5], [1, 6, 7], [1, 9, 2],
  [2, 1, 2], [2, 4, 6], [2, 6, 8], [2, 9, 3],
  [3, 1, 3], [3, 9, 4],
  [5, 1, 4], [5, 4, 9], [5, 6, 1], [5, 9, 5],
  [6, 1, 5], [6, 4, 2], [6, 6, 4], [6, 9, 6],
  [7, 1, 6], [7, 9, 9],
  [8, 1, 9], [8, 2, 5], [8, 8, 7], [8, 9, 1],
  [9, 2, 1], [9, 8, 6],
  [10, 3, 4], [10, 7, 5],
  [11, 3, 9], [11, 7, 7],
  [12, 4, 1], [12, 6, 2],
].map(([row, col, value]) => new Given(cellAt(row, col), value));

return [
  // The answer lives entirely in VB; the main grid is a pinned placeholder.
  // '1-9' widens the value range so VB cells (which take the grid's range)
  // can hold digits 1-9 despite the 1-cell placeholder grid.
  new Shape('1x1', '1-9'),
  new Given('R1C1', 1),
  board,
  ...rows,
  ...columns,
  ...boxes,
  ...givens,
];
