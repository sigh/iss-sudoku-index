// Title: Skirmish In The Horsehead Nebula
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=miLUbvoWwyM
// Source: https://app.crackingthecryptic.com/sudoku/Dqn8J6fnp8

// Star Battle on an 18x18 board: place exactly three stars in every row,
// column and region so that no two stars are orthogonally or diagonally
// adjacent. There are no digits -- every rule here is about which cells
// hold a star.
//
// ISS's own grid is capped at 16 rows and 16 columns (CellGeometry.MAX_SIZE
// applies to a Shape's numRows/numCols as well as to numValues), so the
// 18x18 board cannot be the Shape's own grid. Instead the whole board lives
// in one flat Var group (VS1..VS324, values 0 = no star / 1 = star)
// declared with `columns: 1`, which only checks that width against the cap
// and leaves the derived cell count (324) unchecked. The main grid keeps a
// single unused dummy cell, pinned so it contributes no free choice to the
// search.
//
// Region shapes below are transcribed from the puzzle's stored region
// geometry (SudokuPad cell format [row, col], 0-indexed there, converted to
// 1-indexed here). Sixteen regions were drawn; a Star Battle's regions
// must partition the whole board, and once those sixteen are placed,
// exactly two connected blocks of cells (24 and 17 cells) remain untagged.
// Those two blocks are recovered below as regions 17 and 18 by elimination.

const shape = new Shape('1x1', '0-1', 'Raw');
const stars = new Var('S', 'star', '324x1');

const N = 18;
// 1-based row-major index into the flat 324-cell Var group.
const idx = (r, c) => (r - 1) * N + c;
const cellAt = (r, c) => stars.cell(idx(r, c), 1);

const REGIONS = [
  [[18, 1], [17, 1], [16, 1], [15, 1], [14, 1], [13, 1], [12, 1], [11, 1], [10, 1], [9, 1], [8, 1], [7, 1], [6, 1], [5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [18, 2], [18, 3], [18, 4], [18, 5], [18, 6], [18, 7], [18, 8], [18, 9], [18, 10], [18, 11]], // region 1 (drawn, 37 cells)
  [[2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [4, 3], [5, 3], [4, 4], [5, 4], [4, 5], [5, 5], [6, 4], [6, 5], [6, 6], [6, 7], [5, 7], [5, 8], [5, 9], [6, 9], [6, 10], [5, 10], [4, 10], [3, 10], [3, 9], [3, 8], [3, 7], [5, 11], [6, 11], [6, 12], [6, 13], [5, 13], [5, 14], [5, 15], [6, 15], [6, 14], [7, 14], [4, 15]], // region 2 (drawn, 38 cells)
  [[3, 3], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [4, 7], [4, 8], [4, 9]], // region 3 (drawn, 9 cells)
  [[2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [3, 11], [4, 11], [4, 12], [5, 12], [4, 13], [4, 14]], // region 4 (drawn, 13 cells)
  [[2, 12], [3, 12], [3, 13], [2, 13], [2, 14], [3, 14], [2, 15], [2, 16], [2, 17]], // region 5 (drawn, 9 cells)
  [[1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [1, 16], [1, 17], [1, 18], [2, 18], [3, 18], [4, 18], [5, 18], [6, 18], [7, 18], [8, 18], [9, 18]], // region 6 (drawn, 16 cells)
  [[3, 15], [3, 16], [3, 17], [4, 16], [5, 16], [7, 16], [6, 16], [8, 16], [9, 16], [10, 16], [11, 16], [12, 16]], // region 7 (drawn, 12 cells)
  [[4, 17], [5, 17], [6, 17], [7, 17], [8, 17], [9, 17], [10, 17], [11, 17], [12, 17], [13, 17], [13, 16], [13, 15], [13, 14]], // region 8 (drawn, 13 cells)
  [[10, 18], [12, 18], [11, 18], [13, 18], [14, 18], [15, 18], [16, 18], [17, 18], [18, 18], [18, 17], [18, 16], [18, 15], [18, 14], [18, 13], [18, 12]], // region 9 (drawn, 15 cells)
  [[7, 15], [8, 15], [8, 14], [8, 13], [7, 13], [7, 12], [7, 11], [8, 11], [8, 12], [9, 14], [9, 13], [9, 12], [9, 11], [9, 10], [9, 9], [9, 8]], // region 10 (drawn, 16 cells)
  [[7, 2], [7, 3], [6, 3], [6, 2], [8, 3], [7, 4], [8, 4], [7, 5], [8, 5], [7, 6], [8, 6], [7, 7], [8, 7], [7, 8], [8, 8], [7, 9], [8, 9], [7, 10], [8, 10], [6, 8]], // region 11 (drawn, 20 cells)
  [[8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6], [13, 6], [14, 6], [14, 7], [14, 8], [15, 8], [15, 9], [13, 8], [13, 9], [13, 10], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11], [17, 10], [13, 12], [13, 13], [14, 13], [15, 13], [16, 13], [16, 14], [16, 15], [15, 15], [15, 14], [12, 12], [12, 13], [12, 14], [12, 15], [11, 15]], // region 12 (drawn, 38 cells)
  [[9, 15], [10, 15], [10, 14], [11, 14], [11, 13], [11, 12], [11, 11], [12, 11], [12, 10], [12, 9], [11, 9], [11, 8], [12, 8]], // region 13 (drawn, 13 cells)
  [[10, 13], [10, 12], [10, 11], [10, 10], [11, 10], [10, 9], [10, 8], [10, 7], [11, 7], [12, 7], [13, 7]], // region 14 (drawn, 11 cells)
  [[9, 3], [10, 3], [11, 3], [11, 4], [10, 4], [9, 4], [9, 5], [10, 5], [11, 5], [11, 6], [10, 6], [9, 6], [9, 7]], // region 15 (drawn, 13 cells)
  [[14, 5], [14, 4], [14, 3], [15, 3], [16, 3], [16, 4], [15, 4], [15, 5], [15, 6], [16, 6]], // region 16 (drawn, 10 cells)
  [[13, 2], [13, 3], [13, 4], [13, 5], [14, 2], [14, 9], [14, 10], [15, 2], [15, 7], [15, 10], [16, 2], [16, 5], [16, 7], [16, 8], [16, 9], [16, 10], [17, 2], [17, 3], [17, 4], [17, 5], [17, 6], [17, 7], [17, 8], [17, 9]], // region 17 (recovered, 24 cells)
  [[14, 12], [14, 14], [14, 15], [14, 16], [14, 17], [15, 12], [15, 16], [15, 17], [16, 12], [16, 16], [16, 17], [17, 12], [17, 13], [17, 14], [17, 15], [17, 16], [17, 17]], // region 18 (recovered, 17 cells)
];

// Row and column cell lists, each in physical left-to-right / top-to-bottom
// order.
const rowCells = Array.from({ length: N }, (_, i) =>
  Array.from({ length: N }, (_, j) => cellAt(i + 1, j + 1)));
const colCells = Array.from({ length: N }, (_, j) =>
  Array.from({ length: N }, (_, i) => cellAt(i + 1, j + 1)));

// Exactly three stars in every row, column and region.
const rowSums = rowCells.map(cells => new Sum(3, ...cells));
const colSums = colCells.map(cells => new Sum(3, ...cells));
const regionSums = REGIONS.map(
  cells => new Sum(3, ...cells.map(([r, c]) => cellAt(r, c))));

// No two stars touch, even diagonally: forbid both cells of any king-move
// adjacent pair from holding 1 at once. `Pair` applies its relation to
// consecutive pairs in the given cell list, so listing a whole row, column
// or diagonal in physical order turns every king-move-adjacent pair in that
// line into one consecutive pair -- one Pair call per line covers it, with
// no need for a per-edge constraint or a 2-D cell graph.
const noTouchKey = Pair.fnToKey((a, b) => !(a === 1 && b === 1), shape);
const noTouchPairs = [];
for (const cells of rowCells) {
  noTouchPairs.push(new Pair(noTouchKey, 'no-touch', ...cells));
}
for (const cells of colCells) {
  noTouchPairs.push(new Pair(noTouchKey, 'no-touch', ...cells));
}
// "\" diagonals: r - c constant.
for (let d = -(N - 1); d <= N - 1; d++) {
  const cells = [];
  for (let r = 1; r <= N; r++) {
    const c = r - d;
    if (c >= 1 && c <= N) cells.push(cellAt(r, c));
  }
  if (cells.length > 1) noTouchPairs.push(new Pair(noTouchKey, 'no-touch', ...cells));
}
// "/" diagonals: r + c constant.
for (let s = 2; s <= 2 * N; s++) {
  const cells = [];
  for (let r = 1; r <= N; r++) {
    const c = s - r;
    if (c >= 1 && c <= N) cells.push(cellAt(r, c));
  }
  if (cells.length > 1) noTouchPairs.push(new Pair(noTouchKey, 'no-touch', ...cells));
}

return [
  shape,
  // The dummy main-grid cell carries no rule of its own; pin it so it does
  // not contribute a free, uncounted choice to the search.
  new Given('R1C1', 0),
  stars,
  ...rowSums,
  ...colSums,
  ...regionSums,
  ...noTouchPairs,
];
