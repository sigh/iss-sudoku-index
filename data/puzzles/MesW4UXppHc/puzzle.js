// Title: Outside Little Killer Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=MesW4UXppHc
// Source: https://app.crackingthecryptic.com/sudoku/dQRf4gr2TJ
//
// Normal sudoku rules apply (standard 3x3 boxes, no extra givens).
//
// Little killer diagonals: an off-grid arrow bulbed against one on-grid
// corner cell gives the sum of every cell on that diagonal; digits on a
// diagonal may repeat. A length-1 diagonal (the two corners) is just that
// cell's value, so those are given directly with Sum.
//
// "First three cells" outside clues: a number printed outside a row/column
// must appear somewhere in that row/column's first three cells, counting
// from the side it's printed on (nearest cell first). It does not fix which
// of the three cells holds it, and does not forbid other digits there --
// ContainAtLeast is exactly this membership rule.
//
// Cell-to-clue geometry (which corner/side each arrow or number belongs to)
// was read from the puzzle's own drawn arrow and margin-text positions
// against the framed board.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const littleKillers = [
  // Bottom edge, diagonal runs up-right (dRow -1, dCol +1) from row 9.
  LittleKiller.fromCells(37, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R9C5', -1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C6', -1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C8', -1, 1), geometry),
  // Top edge, diagonal runs down-right (dRow +1, dCol +1) from row 1.
  LittleKiller.fromCells(21, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(15, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(7, graph.ray('R1C8', 1, 1), geometry),
];

const cornerLittleKillers = [
  // Single-cell diagonals at the two far corners: the "sum" is the cell.
  new Sum(4, 'R9C9'),
  new Sum(8, 'R1C9'),
];

const outsideFirstThree = [
  // Left side: first three cells reading left-to-right (C1, C2, C3).
  new ContainAtLeast('5_7', ...graph.ray('R1C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('2_4', ...graph.ray('R3C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('2_8', ...graph.ray('R4C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('1_9', ...graph.ray('R5C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('6_7', ...graph.ray('R6C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('1_2', ...graph.ray('R7C1', 0, 1).slice(0, 3)),
  new ContainAtLeast('5_9', ...graph.ray('R9C1', 0, 1).slice(0, 3)),

  // Right side: first three cells reading right-to-left (C9, C8, C7).
  new ContainAtLeast('7_9', ...graph.ray('R4C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('3_5', ...graph.ray('R5C9', 0, -1).slice(0, 3)),
  new ContainAtLeast('2_4', ...graph.ray('R6C9', 0, -1).slice(0, 3)),

  // Top side: first three cells reading top-to-bottom (R1, R2, R3).
  new ContainAtLeast('3_4', ...graph.ray('R1C1', 1, 0).slice(0, 3)),
  new ContainAtLeast('2_6', ...graph.ray('R1C3', 1, 0).slice(0, 3)),

  // Bottom side: first three cells reading bottom-to-top (R9, R8, R7).
  new ContainAtLeast('7_9', ...graph.ray('R9C2', -1, 0).slice(0, 3)),
];

return [
  new Shape('9x9'),
  ...littleKillers,
  ...cornerLittleKillers,
  ...outsideFirstThree,
];
