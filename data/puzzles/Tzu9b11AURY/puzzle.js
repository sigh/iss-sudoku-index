// Title: unknown
// Author: Thomas Johnsen
// Video: https://www.youtube.com/watch?v=Tzu9b11AURY
// Source: https://cracking-the-cryptic.web.app/sudoku/qhGNMT2fgH

// Rules: standard sudoku (rows, columns, 3x3 boxes all contain 1-9 once),
// plus Sandwich, Antiknight and Diagonal Sudoku (video description). Sandwich
// clues give the sum of digits between the 1 and the 9 in that row/column.
// Antiknight forbids equal digits a knight's move apart. Diagonal Sudoku
// requires both main diagonals to contain each digit once; the payload draws
// both diagonals (R1C1-R9C9 and R1C9-R9C1) as thin grey lines with no rules
// text distinguishing them, so both are enforced.

const geometry = cellGeometry('9x9');

// Sandwich clue values, keyed by column (top lane) and row (left lane), read
// from the payload's outside-clue text overlays; a missing key means that
// lane's overlay text is empty (no clue).
const columnSandwich = { 1: 6, 3: 29, 4: 17, 5: 8, 6: 0, 7: 0, 9: 12 };
const rowSandwich = { 2: 8, 3: 28, 4: 35, 6: 27, 7: 16, 8: 0 };

const columnCells = c => [...Array(9)].map((_, r) => makeCellId(r + 1, c));
const rowCells = r => [...Array(9)].map((_, c) => makeCellId(r, c + 1));

return [
  new Shape('9x9'),

  new Given('R5C5', 9),

  new AntiKnight(),

  new Diagonal(1),
  new Diagonal(-1),

  ...Object.entries(columnSandwich).map(([c, value]) =>
    Sandwich.fromCells(value, columnCells(+c), geometry)),
  ...Object.entries(rowSandwich).map(([r, value]) =>
    Sandwich.fromCells(value, rowCells(+r), geometry)),
];
