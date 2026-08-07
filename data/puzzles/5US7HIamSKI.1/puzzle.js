// Title: August 5, 2022: Expanded Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=5US7HIamSKI
// Source: https://tinyurl.com/2887g7oo

// Rules: Normal sudoku rules apply. Rows and columns extend across the blank
// spaces.
//
// Board: a 12x12 canvas of sixteen 3x3 blocks, four of which are blank and hold
// nothing. The four blank blocks sit one per band of three rows and one per
// stack of three columns, so every canvas row and every canvas column holds
// exactly nine playable cells. Those nine hold 1-9 once each -- that is the
// "rows and columns extend across the blank spaces" clause -- and so does each
// of the twelve playable 3x3 boxes.
//
// Nothing is omitted.
//
// Modelling the blank cells: an ISS grid needs at least as many values as its
// widest dimension, so a 12x12 board cannot be given a 9-value alphabet. The
// board is therefore a 12x12 grid over 1-12, and the blank cells carry the
// three spare values 10, 11 and 12. Each blank block is pinned to a fixed
// 10/11/12 pattern; that leaves nine unpinned cells in every canvas row and
// column, and the grid's own row/column all-different groups over 1-12 then
// force those nine to be exactly 1-9. No two blank blocks share a canvas row or
// column, so the pinned pattern is self-contained padding: it constrains no
// playable cell, and it is pinned only so the padding's own 3x3 Latin-square
// freedom does not multiply the solution count.

const shape = new Shape('12x12', 12);
const graph = cellGraph(shape);

// Top-left cell of each blank 3x3 block, read off the drawn box borders: the
// borders drawn between adjacent blocks are exactly the adjacencies of the
// other twelve blocks.
const blankBlocks = [[1, 10], [4, 4], [7, 7], [10, 1]];

const allBlocks = [1, 4, 7, 10].flatMap(
  (row) => [1, 4, 7, 10].map((col) => [row, col]));

// The puzzle's boxes: every 3x3 block of the canvas except the blank ones.
// The default 12x12 boxes are 3x4, so they are dropped with NoBoxes.
const boxes = allBlocks
  .filter(([row, col]) => !blankBlocks.some(
    ([r0, c0]) => r0 === row && c0 === col))
  .map(([row, col]) => new AllDifferent(
    ...graph.block(makeCellId(row, col), 3, 3)));

// Padding pin: values 10-12 laid out diagonally within each blank block, which
// keeps them distinct down every row and column of the block.
const blankPins = blankBlocks.flatMap(
  ([r0, c0]) => [0, 1, 2].flatMap(
    (i) => [0, 1, 2].map(
      (j) => new Given(makeCellId(r0 + i, c0 + j), 10 + (i + j) % 3))));

// The 34 drawn givens, as [row, column, digit].
const givens = [
  [1, 9, 3],
  [2, 2, 4], [2, 3, 5], [2, 4, 8], [2, 5, 6], [2, 6, 2],
  [3, 2, 8], [3, 6, 4],
  [4, 2, 6], [4, 7, 3], [4, 8, 4], [4, 9, 5],
  [5, 2, 7], [5, 9, 6],
  [6, 2, 2], [6, 3, 1], [6, 9, 7],
  [7, 4, 1], [7, 10, 4], [7, 11, 6],
  [8, 4, 3], [8, 11, 5],
  [9, 4, 5], [9, 5, 7], [9, 6, 9], [9, 11, 2],
  [10, 7, 2], [10, 11, 8],
  [11, 7, 9], [11, 8, 5], [11, 9, 8], [11, 10, 2], [11, 11, 4],
  [12, 4, 2],
].map(([row, col, value]) => new Given(makeCellId(row, col), value));

return [
  shape,
  new NoBoxes(),
  ...boxes,
  ...blankPins,
  ...givens,
];
