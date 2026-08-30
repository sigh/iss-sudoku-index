// Title: Sandwich Sudoku (With Extra Ants!)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hR_AJpwGwBA
// Source: https://cracking-the-cryptic.web.app/sudoku/mbpTBgtRmj

// Normal Sudoku plus a Sandwich clue for every row and column (the digits
// between the 1 and the 9 sum to the printed value). The ant path from the
// green cell (R1C9) to the red cell (R2C9) is not represented here.
const geometry = cellGeometry('9x9');

// Row cells, left to right; column cells, top to bottom -- the printed
// clue direction, per the payload's outside-clue overlays.
const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const col = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));

return [
  new Shape('9x9'),
  new Given('R1C9', 2),
  new Given('R6C5', 6),

  // Row sandwich clues, top to bottom.
  Sandwich.fromCells(7, row(1), geometry),
  Sandwich.fromCells(5, row(2), geometry),
  Sandwich.fromCells(7, row(3), geometry),
  Sandwich.fromCells(22, row(4), geometry),
  Sandwich.fromCells(5, row(5), geometry),
  Sandwich.fromCells(30, row(6), geometry),
  Sandwich.fromCells(35, row(7), geometry),
  Sandwich.fromCells(0, row(8), geometry),
  Sandwich.fromCells(14, row(9), geometry),

  // Column sandwich clues, left to right.
  Sandwich.fromCells(0, col(1), geometry),
  Sandwich.fromCells(18, col(2), geometry),
  Sandwich.fromCells(7, col(3), geometry),
  Sandwich.fromCells(13, col(4), geometry),
  Sandwich.fromCells(31, col(5), geometry),
  Sandwich.fromCells(3, col(6), geometry),
  Sandwich.fromCells(31, col(7), geometry),
  Sandwich.fromCells(2, col(8), geometry),
  Sandwich.fromCells(23, col(9), geometry),
];
