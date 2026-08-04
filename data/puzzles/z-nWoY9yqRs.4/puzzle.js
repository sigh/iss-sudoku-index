// Title: April 9, 2023: Panini Press
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=z-nWoY9yqRs
// Source: https://tinyurl.com/5zcxtutm
//
// Normal sudoku, default 3x3 boxes, no givens.
// Sandwich: each outside clue gives the sum of digits strictly between the 1
// and the 9 in that row/column. Built via Sandwich.fromCells so the canonical
// row/column is derived from the drawn clue's own row/column, not a
// hand-picked corner id.
// Thermo: digits strictly increase from the bulb (first cell of each drawn
// line) to the tip.

const geometry = cellGeometry('9x9');
const row = r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const col = c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));

// Sandwich clue positions from the source's outside-cell coordinates:
// R#C0 -> row #, R0C# -> column #.
const sandwiches = [
  Sandwich.fromCells(35, row(1), geometry),
  Sandwich.fromCells(35, row(5), geometry),
  Sandwich.fromCells(30, row(9), geometry),
  Sandwich.fromCells(19, col(1), geometry),
  Sandwich.fromCells(24, col(5), geometry),
  Sandwich.fromCells(12, col(9), geometry),
];

// Thermometers as drawn (bulb cell listed first in each array).
const thermoLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R4C1', 'R3C1', 'R2C1'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R3C9', 'R2C9'],
];
const thermos = thermoLines.map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  ...sandwiches,
  ...thermos,
];
