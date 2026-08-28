// Title: Sandwich Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=bU2fVpUHZ1o
// Source: https://cracking-the-cryptic.web.app/sudoku/8DNJF33dhH

// Rules: normal sudoku rules apply (regions are the ordinary 3x3 boxes, per
// the payload's `regions` array). Clues outside the grid give the sum of the
// digits sandwiched between the 1 and the 9 in that row/column; a 0 clue
// means the 1 and 9 are adjacent. Only 4 rows and 4 columns carry a sandwich
// clue -- the rest of the grid is governed by normal sudoku rules alone.

const shape = new Shape('9x9');
const geometry = cellGeometry(shape);
const graph = cellGraph(shape);
const rows = graph.rows();       // rows[r] = [R{r+1}C1 .. R{r+1}C9]
const columns = graph.columns(); // columns[c] = [R1C{c+1} .. R9C{c+1}]

// Givens (payload `cells[row][col].value`).
const givens = [
  new Given('R2C6', 8),
  new Given('R3C4', 3),
  new Given('R4C2', 4),
  new Given('R4C7', 1),
  new Given('R5C5', 5),
  new Given('R6C3', 9),
  new Given('R6C8', 6),
  new Given('R7C6', 7),
  new Given('R8C4', 2),
];

// Sandwich sum clues (8 overlays: 4 row clues left of the grid, 4 column
// clues above it). Sandwich sums are direction-independent, so fromCells
// resolves the correct arrowId regardless of scan direction.
const sandwiches = [
  Sandwich.fromCells(0, rows[1], geometry),   // left of row 2 (overlay #4)
  Sandwich.fromCells(8, rows[3], geometry),   // left of row 4 (overlay #5)
  Sandwich.fromCells(7, rows[5], geometry),   // left of row 6 (overlay #6)
  Sandwich.fromCells(21, rows[7], geometry),  // left of row 8 (overlay #7)
  Sandwich.fromCells(10, columns[1], geometry), // above column 2 (overlay #0)
  Sandwich.fromCells(28, columns[3], geometry), // above column 4 (overlay #1)
  Sandwich.fromCells(14, columns[5], geometry), // above column 6 (overlay #2)
  Sandwich.fromCells(27, columns[7], geometry), // above column 8 (overlay #3)
];

return [
  shape,
  ...givens,
  ...sandwiches,
];
