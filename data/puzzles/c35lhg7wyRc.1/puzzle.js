// Title: Sandwich Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c35lhg7wyRc
// Source: https://app.crackingthecryptic.com/sudoku/tRpP92NMr2

// Standard 9x9 Sudoku (rows, columns, boxes all-different). Each outside
// clue gives the sum of the digits strictly between the 1 and the 9 in the
// row/column it lines up with (Sandwich). Clue positions and values are
// transcribed from the payload's outside-margin overlays.
const geometry = cellGeometry('9x9');
const rowCells = row => Array.from({length: 9}, (_, c) => makeCellId(row, c + 1));
const colCells = col => Array.from({length: 9}, (_, r) => makeCellId(r + 1, col));

return [
  new Shape('9x9'),
  new Given('R2C3', 8), new Given('R2C7', 3),
  new Given('R3C5', 2),
  new Given('R5C5', 1),
  new Given('R6C4', 4), new Given('R6C6', 8),
  new Given('R7C3', 6), new Given('R7C7', 2),
  new Given('R8C2', 3), new Given('R8C8', 7),

  Sandwich.fromCells(35, colCells(1), geometry),
  Sandwich.fromCells(6, colCells(3), geometry),
  Sandwich.fromCells(21, colCells(5), geometry),
  Sandwich.fromCells(20, colCells(9), geometry),
  Sandwich.fromCells(35, rowCells(1), geometry),
  Sandwich.fromCells(0, rowCells(3), geometry),
  Sandwich.fromCells(21, rowCells(5), geometry),
  Sandwich.fromCells(9, rowCells(9), geometry),
];
