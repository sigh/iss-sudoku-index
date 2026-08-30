// Title: Sandwich Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Af5lant5Ia4
// Source: https://cracking-the-cryptic.web.app/sudoku/bdbPQJgdHb

// Normal 9x9 sudoku (default rows, columns, 3x3 boxes -> Shape('9x9')).
// 18 outside clues, one to the left of each row and one above each column:
// the digits strictly between the 1 and the 9 in that row/column sum to
// the printed value -> Sandwich (source overlays #0-#17). No arrow/shaft is
// drawn on any overlay, clues sit only on the left/top edges, and two are
// printed as 0 (only reachable when 1 and 9 are adjacent); Sandwich is the
// only ISS outside-clue class restricted to top/left and the only one whose
// value can be 0, so all three facts settle Sandwich over Little Killer or
// any other outside-clue reading.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Row clues, left of grid (source overlays #9,#10,#11,#13,#15,#16,#12,#17,#14).
const rowClues = [35, 4, 15, 18, 0, 0, 15, 24, 18];
// Column clues, above grid (source overlays #0-#8).
const colClues = [27, 8, 14, 3, 3, 12, 6, 12, 35];

const rowSandwiches = rowClues.map((total, i) =>
  Sandwich.fromCells(total, graph.row(i + 1), geometry));
const colSandwiches = colClues.map((total, i) =>
  Sandwich.fromCells(total, graph.column(i + 1), geometry));

return [
  new Shape('9x9'),

  // Givens (source cells[].value).
  new Given('R2C5', 4),
  new Given('R3C6', 7),
  new Given('R4C3', 8),
  new Given('R4C5', 7),
  new Given('R5C2', 7),
  new Given('R5C4', 4),
  new Given('R5C6', 1),
  new Given('R5C8', 3),
  new Given('R6C5', 8),
  new Given('R6C7', 7),
  new Given('R7C4', 2),
  new Given('R8C5', 3),

  ...rowSandwiches,
  ...colSandwiches,
];
