// Title: 8/8/23: Neosauropod Radiation
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=fI46Yf_Zug8
// Source: https://tinyurl.com/mrx36a3m

// Normal sudoku rules apply. Nine Little Killer diagonals (digits may
// repeat along a diagonal; only the standard sudoku all-different rules
// constrain each cell) are transcribed from the payload's
// `littlekillersum` array: each entry there gives an entry cell and a
// direction the arrow travels into the grid, reproduced below as
// graph.ray(entryCell, dRow, dCol) so the ray walks to the grid edge the
// same way the payload's own `cells` list does.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const givens = [
  new Given('R1C5', 7),
  new Given('R2C2', 4),
  new Given('R2C8', 6),
  new Given('R3C3', 5),
  new Given('R4C4', 6),
  new Given('R5C1', 9),
  new Given('R5C3', 4),
  new Given('R5C7', 6),
  new Given('R5C9', 8),
  new Given('R6C6', 2),
  new Given('R7C7', 3),
  new Given('R8C2', 6),
  new Given('R8C8', 4),
  new Given('R9C5', 1),
];

const littleKillers = [
  LittleKiller.fromCells(9, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(12, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(9, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(11, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(41, graph.ray('R1C1', 1, 1), geometry),
];

return [
  new Shape('9x9'),
  ...givens,
  ...littleKillers,
];
