// Title: A Slippery Sandwich
// Author: Unknown
// Video: https://www.youtube.com/watch?v=e5v4_Z1b_mg
// Source: https://cracking-the-cryptic.web.app/sudoku/n6QMQ7nRF6

// Normal sudoku rules apply (rows, columns and 3x3 boxes all-different --
// standard for a plain 9x9 Shape). Sandwich: the digits strictly between the
// 1 and the 9 in a row or column sum to the clue printed outside that lane
// (Sandwich; a clue of 0 means 1 and 9 are adjacent). The payload carries no
// rules text; this reading is taken from genre convention, supported by the
// video description naming the puzzle a "sandwich sudoku" and every lane
// carrying an outside-clue overlay.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Given digits, provenance: payload cell values (source-computed row/col ->
// 1-indexed R#C#).
const givens = [
  new Given('R2C2', 4),
  new Given('R2C5', 2),
  new Given('R2C8', 3),
  new Given('R5C2', 2),
  new Given('R5C8', 1),
  new Given('R8C2', 6),
  new Given('R8C5', 9),
  new Given('R8C8', 5),
];

// Sandwich clues as printed, outer lane order R1..R9 and C1..C9 (source
// overlays #9-#17 for rows, #0-#8 for columns). Row and column sequences are
// identical.
const rowClues = [17, 17, 17, 17, 20, 22, 27, 17, 0];
const colClues = [17, 17, 17, 17, 20, 22, 27, 17, 0];

const rowSandwiches = rowClues.map(
  (total, i) => Sandwich.fromCells(total, graph.row(i + 1), geometry));
const colSandwiches = colClues.map(
  (total, i) => Sandwich.fromCells(total, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),
  ...givens,
  ...rowSandwiches,
  ...colSandwiches,
];
