// Title: Untitled Knight Sandwich
// Author: Jeremy Butler
// Video: https://www.youtube.com/watch?v=YGM3nwRxp6k
// Source: https://cracking-the-cryptic.web.app/sudoku/gMBR3TNRTq

// Normal sudoku rules apply (default row/column/box all-different). Each
// outside-grid clue gives the sandwich sum -- the total of the digits
// strictly between the 1 and the 9 -- in that row/column, via Sandwich.
// Identical digits cannot be a knight's move apart, via AntiKnight (global,
// no drawn marks -- a text-only rule).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Row sandwich sums (left-of-grid lane), R1..R9, read off the outside-clue
// overlays.
const rowSums = [2, 18, 22, 19, 0, 33, 9, 2, 28];
// Column sandwich sums (top-of-grid lane), C1..C9, likewise.
const colSums = [5, 28, 8, 0, 29, 21, 2, 8, 7];

return [
  new Shape('9x9'),

  new Given('R8C5', 1),

  ...rowSums.map((sum, i) =>
    Sandwich.fromCells(sum, graph.row(i + 1), geometry)),
  ...colSums.map((sum, i) =>
    Sandwich.fromCells(sum, graph.column(i + 1), geometry)),

  new AntiKnight(),
];
