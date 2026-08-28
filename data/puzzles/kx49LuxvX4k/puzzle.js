// Title: Sudoku Facile
// Author: Unknown
// Video: https://www.youtube.com/watch?v=kx49LuxvX4k
// Source: https://cracking-the-cryptic.web.app/sudoku/82g943nFGB

// Normal sudoku rules apply -- standard 3x3 boxes, the payload's own regions
// array (default Shape('9x9') boxes match it). Every printed outside clue is
// a "liar" sandwich sum: it is one away (+1 or -1) from the true sum of the
// digits strictly between the 1 and the 9 in that row/column, never equal to
// it, so each lane becomes a disjunction of the two Sandwich readings
// bracketing the printed value.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

function liarSandwich(printed, cells) {
  return new Or([
    Sandwich.fromCells(printed - 1, cells, geometry),
    Sandwich.fromCells(printed + 1, cells, geometry),
  ]);
}

// Left-of-row clues, R1..R9 (overlays #1,#2,#5,#10,#6,#11,#7,#8,#3).
const rowClues = [5, 8, 5, 16, 12, 7, 5, 3, 1];
const rowSandwiches = rowClues.map(
  (value, i) => liarSandwich(value, graph.row(i + 1)));

// Above-column clues: only C1, C5 and C9 are drawn (overlays #0, #9, #4);
// the other six columns carry no outside clue.
const colClues = [[1, 5], [5, 4], [9, 5]];
const colSandwiches = colClues.map(
  ([col, value]) => liarSandwich(value, graph.column(col)));

return [
  new Shape('9x9'),
  new Given('R1C3', 6),
  new Given('R3C2', 1),
  new Given('R4C5', 1),
  new Given('R5C2', 4),
  new Given('R6C3', 9),
  new Given('R6C7', 2),
  new Given('R9C2', 7),
  new Given('R9C9', 8),
  ...rowSandwiches,
  ...colSandwiches,
];
