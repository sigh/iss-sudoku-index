// Title: Sherlock Holmes Vs Sudoku
// Author: Ukudos
// Video: https://www.youtube.com/watch?v=VXwUX7Xj52s
// Source: https://cracking-the-cryptic.web.app/sudoku/bn33QnHNRh

// Standard sudoku (rows, columns, boxes all-different; no givens) plus:
//  - AntiKnight: cells a knight's move apart cannot repeat a digit.
//  - Eight outside diagonal-sum clues (LittleKiller: sum along the diagonal,
//    digits may repeat). Start cell and direction for each diagonal are taken
//    from the drawn arrow attached to each outside number; cellGraph().ray()
//    walks the diagonal to the grid edge from that arrow's own start cell and
//    direction, so the diagonal itself is derived from the drawn data, not
//    hand-listed.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// [sum, start cell, [dRow, dCol]] -- one row per drawn arrow + outside number
// pair, read from each arrow's own drawn start cell and direction.
const littleKillers = [
  [24, 'R1C3', [1, -1]],
  [52, 'R3C1', [1, 1]],
  [17, 'R4C1', [1, 1]],
  [30, 'R5C1', [1, 1]],
  [32, 'R6C1', [1, 1]],
  [16, 'R7C1', [1, 1]],
  [9, 'R8C1', [1, 1]],
  [19, 'R9C7', [-1, 1]],
].map(([sum, start, [dr, dc]]) =>
  LittleKiller.fromCells(sum, graph.ray(start, dr, dc), geometry));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...littleKillers,
];
