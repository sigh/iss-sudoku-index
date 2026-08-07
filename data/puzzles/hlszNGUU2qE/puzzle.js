// Title: Sandwich Between Sudoku
// Author: TheScrasse
// Video: https://www.youtube.com/watch?v=hlszNGUU2qE
// Source: https://sudokupad.app/7ejxpjqo2v

// Normal Sudoku (default Shape row/column/box all-different) plus:
// Sandwich: an outside clue gives the sum of the digits strictly between the
// 1 and the 9 in that row/column (rules text "Sandwich").
// Between: cells on a grey line must be strictly between the digits of the
// line's two circled ends (rules text "Between"). Per the source overlays,
// each line's two circled cells are exactly its first and last cell below;
// every interior cell is uncircled.

const geometry = cellGeometry('9x9');
const rowCells = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

const sandwiches = [
  Sandwich.fromCells(16, rowCells(2), geometry),
  Sandwich.fromCells(0, rowCells(6), geometry),
  Sandwich.fromCells(0, rowCells(7), geometry),
  Sandwich.fromCells(8, rowCells(8), geometry),
  Sandwich.fromCells(18, colCells(1), geometry),
  Sandwich.fromCells(16, colCells(3), geometry),
  Sandwich.fromCells(0, colCells(5), geometry),
  Sandwich.fromCells(0, colCells(6), geometry),
  Sandwich.fromCells(18, colCells(8), geometry),
];

const betweens = [
  new Between('R2C1', 'R1C1', 'R2C2'),
  new Between('R2C4', 'R3C3', 'R4C2', 'R5C1'),
  new Between(
    'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7',
    'R5C8', 'R5C9', 'R4C9', 'R3C9', 'R2C9'),
  new Between('R1C7', 'R1C6', 'R1C5'),
  new Between('R7C4', 'R6C5', 'R5C6', 'R6C6', 'R7C5'),
  new Between(
    'R8C3', 'R9C3', 'R8C4', 'R8C5',
    'R9C6', 'R9C7', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...betweens,
];
