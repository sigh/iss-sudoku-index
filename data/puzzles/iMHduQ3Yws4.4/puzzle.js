// Title: June 13, 2023: Roll Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=iMHduQ3Yws4
// Source: https://tinyurl.com/2utu2tv3

// Two overlapping 9x9 classic sudoku grids on a 12-row x 9-column canvas: the
// top grid is rows 1-9, the bottom grid is rows 4-12, and rows 4-9 are the
// same physical cells read by both grids. The automatic column all-different
// of a Sudoku grid would force 12 cells in one column to be pairwise
// distinct, impossible with only 9 values, so the grid is Raw: every
// row/column/box all-different is added explicitly.
const shape = new Shape('12x9', 9, 'Raw');
const graph = cellGraph(shape);
const cellAt = (row, col) => makeCellId(row, col);

// Physical rows: every row is 9 cells regardless of which grid(s) it
// belongs to, so one all-different per row (1-12) covers both grids' row
// rules.
const rows = graph.rows().map(row => new AllDifferent(...row));

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
// box appears exactly once. A Raw grid has no default boxes, so build them
// explicitly.
const boxes = [];
for (let r = 1; r <= 12; r += 3)
  for (let c = 1; c <= 9; c += 3)
    boxes.push(new AllDifferent(...graph.block(makeCellId(r, c), 3, 3)));

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
  shape,
  ...rows,
  ...columns,
  ...boxes,
  ...givens,
];
