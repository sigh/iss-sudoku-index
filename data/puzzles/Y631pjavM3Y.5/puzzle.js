// Title: 3/3: Sudoku Make Me A Sandwich
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Y631pjavM3Y
// Source: https://tinyurl.com/2p8znhx9

// Normal sudoku rules. Each sandwich clue gives the sum of the digits
// between the 1 and the 9 in its row or column (the 1 and 9 excluded).
// Column clues (above the grid) and row clues (left of the grid) are
// transcribed from the puzzle payload's outside-clue list; a column/row
// with no listed clue carries no sandwich constraint.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Column sandwich clues (payload outside-clue column index -> value).
// Column 9 has no clue.
const columnSandwiches = [
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
].map(([col, value]) => Sandwich.fromCells(
  value, graph.column(col), geometry));

// Row sandwich clues (payload outside-clue row index -> value). Rows 2,
// 4, 6, 8, 9 have no clue.
const rowSandwiches = [
  [1, 30], [3, 25], [5, 20], [7, 15],
].map(([row, value]) => Sandwich.fromCells(
  value, graph.row(row), geometry));

return [
  new Shape('9x9'),

  // Givens, from the puzzle payload's grid.
  new Given('R1C1', 1),
  new Given('R2C5', 4),
  new Given('R3C6', 7),
  new Given('R4C2', 2),
  new Given('R4C8', 9),
  new Given('R5C5', 8),
  new Given('R6C2', 1),
  new Given('R6C8', 3),
  new Given('R7C4', 5),
  new Given('R8C5', 6),
  new Given('R9C9', 9),

  ...columnSandwiches,
  ...rowSandwiches,
];
