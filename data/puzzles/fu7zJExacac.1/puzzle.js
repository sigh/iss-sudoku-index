// Title: Linked 6x6
// Author: Unknown
// Video: https://www.youtube.com/watch?v=fu7zJExacac
// Source: https://cracking-the-cryptic.web.app/sudoku/2NJ6T6t2jR

// Two independent 6x6 classic sudoku grids (values 1-6, each row, column and
// box all-different) sit side by side on the canvas with an unused spacer
// column between them. That spacer carries no cells or clues, so the board
// is modelled as a 6x12 canvas: columns 1-6 are the left grid, columns 7-12
// are the right grid (the source's single unused spacer column is simply
// dropped). The left grid's boxes are 2 rows x 3 columns; the right grid's
// boxes are 3 rows x 2 columns, per the source's drawn regions.
// Because the two grids' rows/columns must not interact (12 cells, only 6
// values), the canvas is Raw and every row/column/box all-different is added
// explicitly.
//
// Rule (video description): "A number in the left grid must be different
// from the number in the corresponding cell in the right grid." Corresponding
// cell = same row, same column position within its own 6x6 grid, i.e. left
// grid's column i pairs with right grid's column i for i = 1..6.
const shape = new Shape('6x12', 6, 'Raw');
const graph = cellGraph(shape);
const cellAt = (row, col) => makeCellId(row, col);

// Rows: each grid's own 6-cell half is all-different; the two halves are not
// related to each other by the row rule.
const rows = [];
for (let r = 1; r <= 6; r++) {
  rows.push(new AllDifferent(...Array.from({ length: 6 }, (_, i) => cellAt(r, i + 1))));
  rows.push(new AllDifferent(...Array.from({ length: 6 }, (_, i) => cellAt(r, i + 7))));
}

// Columns: every column of the 6x12 canvas lies entirely within one grid, so
// a plain per-column all-different over all 6 rows covers both grids.
const columns = Array.from({ length: 12 }, (_, i) => {
  const c = i + 1;
  return new AllDifferent(...Array.from({ length: 6 }, (_, r) => cellAt(r + 1, c)));
});

// Boxes: left grid 2x3 boxes, right grid 3x2 boxes, per the source's drawn
// region shapes.
const leftBoxTopLefts = [[1, 1], [3, 1], [5, 1], [1, 4], [3, 4], [5, 4]];
const rightBoxTopLefts = [[1, 7], [1, 9], [1, 11], [4, 7], [4, 9], [4, 11]];
const boxes = [
  ...leftBoxTopLefts.map(([r, c]) => new AllDifferent(...graph.block(cellAt(r, c), 2, 3))),
  ...rightBoxTopLefts.map(([r, c]) => new AllDifferent(...graph.block(cellAt(r, c), 3, 2))),
];

// Linked-grid rule: left grid cell (r, i) must differ from right grid cell
// (r, i) at the same position, for i = 1..6. A two-cell AllDifferent is a
// plain not-equal.
const linked = [];
for (let r = 1; r <= 6; r++) {
  for (let i = 1; i <= 6; i++) {
    linked.push(new AllDifferent(cellAt(r, i), cellAt(r, i + 6)));
  }
}

// Givens, transcribed from the source's per-cell digits and remapped onto
// the 6x12 canvas: left-grid columns keep their original column; right-grid
// columns shift down by one to skip the dropped spacer column.
const givens = [
  [1, 4, 4], [1, 9, 5],
  [2, 3, 3], [2, 10, 4],
  [3, 2, 2], [3, 6, 5], [3, 7, 3], [3, 11, 1],
  [4, 1, 1], [4, 5, 4], [4, 8, 4], [4, 12, 2],
  [5, 4, 5], [5, 9, 3],
  [6, 3, 2], [6, 10, 5],
].map(([row, col, value]) => new Given(cellAt(row, col), value));

return [
  shape,
  ...rows,
  ...columns,
  ...boxes,
  ...linked,
  ...givens,
];
