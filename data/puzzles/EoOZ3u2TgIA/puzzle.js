// Title: Killer With Sandwiches
// Author: JoWovrin
// Video: https://www.youtube.com/watch?v=EoOZ3u2TgIA
// Source: https://app.crackingthecryptic.com/sudoku/mbFRbGfbMH

// Normal sudoku rules apply (default 9x9 shape, default row/col/box
// all-different). In cages digits must sum to the small clue in the cage's
// top-left cell, cage digits are distinct (Cage). Clues outside the grid
// give the sum of the digits strictly between the 1 and the 9 in that
// row/column (Sandwich, direction-agnostic so fromCells matches either end).

const geometry = cellGeometry(9);

// Cages: cells and totals transcribed from the payload's drawn cage list
// (11 real cages; other entries in that list are non-cage metadata stubs).
const cages = [
  [14, 'R1C4', 'R1C5'],
  [12, 'R2C4', 'R3C4'],
  [8, 'R4C5', 'R5C5', 'R6C5'],
  [14, 'R4C6', 'R4C7'],
  [10, 'R6C3', 'R6C4'],
  [8, 'R3C1', 'R4C1'],
  [7, 'R5C1', 'R6C1'],
  [9, 'R6C9', 'R7C9'],
  [12, 'R7C8', 'R8C8'],
  [9, 'R7C6', 'R8C6'],
  [13, 'R9C5', 'R9C6'],
];

// Sandwich clues: lane (row/col number) and printed sum, from the 5
// `overlays` text entries (outside-clue lanes: left R1/R5/R9, top C3/C7).
const sandwiches = [
  { row: 1, sum: 15 },
  { row: 5, sum: 27 },
  { row: 9, sum: 14 },
];
const sandwichCols = [
  { col: 3, sum: 12 },
  { col: 7, sum: 22 },
];

const rowCells = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const colCells = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...sandwiches.map(({ row, sum }) => Sandwich.fromCells(sum, rowCells(row), geometry)),
  ...sandwichCols.map(({ col, sum }) => Sandwich.fromCells(sum, colCells(col), geometry)),
];
