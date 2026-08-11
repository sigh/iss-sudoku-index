// Title: This is Sparta
// Author: Disasterinprogress
// Video: https://www.youtube.com/watch?v=bue3qgdI7fU
// Source: https://app.crackingthecryptic.com/sudoku/66LQtQ7tJ3

// Normal sudoku rules (default Shape('9x9') row/col/box all-different).
// Cages sum to their printed total (killer cages: distinct digits, Cage).
// Along a thermometer, digits strictly increase from the bulb cell listed
// first (Thermo enforces this from its first argument).
// A cell holding an unattached grey circle (one that is not the bulb of a
// thermometer) contains an odd digit: encoded as a multi-value Given
// restricting the cell to {1,3,5,7,9}.
// A clue outside the top of the grid gives the total of the digits strictly
// between the 1 and the 9 in that column. This is exactly the class
// Sandwich's stated semantics ("Values between the 1 and the 9 in the row
// or column must add to the given sum"), so each column clue below is one
// Sandwich built from its column's cells via the documented
// Sandwich.fromCells(value, cells, geometry) factory.

const geometry = cellGeometry('9x9');

// Cage cells and totals, transcribed from the drawn cage outlines/totals.
const cages = [
  [20, 'R1C2', 'R1C3', 'R2C3', 'R2C2'],
  [12, 'R3C2', 'R3C3'],
  [10, 'R4C2', 'R4C3', 'R5C3', 'R5C2'],
  [15, 'R6C2', 'R6C3'],
  [23, 'R7C2', 'R7C3', 'R8C3', 'R8C2'],
  [10, 'R9C2', 'R9C3'],
  [23, 'R1C5', 'R1C6', 'R2C6', 'R2C5'],
  [10, 'R3C5', 'R3C6'],
  [20, 'R4C5', 'R4C6', 'R5C6', 'R5C5'],
  [12, 'R6C5', 'R6C6'],
  [10, 'R7C5', 'R7C6', 'R8C6', 'R8C5'],
  [15, 'R9C5', 'R9C6'],
  [10, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [15, 'R3C8', 'R3C9'],
  [23, 'R4C8', 'R4C9', 'R5C9', 'R5C8'],
  [10, 'R6C8', 'R6C9'],
  [20, 'R8C9', 'R7C9', 'R7C8', 'R8C8'],
  [12, 'R9C8', 'R9C9'],
].map(([total, ...cells]) => new Cage(total, ...cells));

// Thermometer cell paths (bulb first), transcribed from the drawn lines;
// each 3-cell line's grey-circle overlay sits on its first (bulb) cell,
// confirming the bulb end.
const thermos = [
  ['R3C1', 'R2C1', 'R1C1'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R9C4', 'R8C4', 'R7C4'],
  ['R6C4', 'R5C4', 'R4C4'],
  ['R3C4', 'R2C4', 'R1C4'],
  ['R3C7', 'R2C7', 'R1C7'],
  ['R6C7', 'R5C7', 'R4C7'],
  ['R9C7', 'R8C7', 'R7C7'],
].map(cells => new Thermo(...cells));

// Grey-circle overlays that do not sit on any thermometer cell (odd digit).
const oddCircles = ['R2C6', 'R8C3', 'R5C9']
  .map(cell => new Given(cell, 1, 3, 5, 7, 9));

// Sandwich totals for columns C1..C9, transcribed from the outside-clue
// circles printed above the grid.
const sandwichTotals = [3, 0, 0, 3, 0, 0, 3, 0, 0];
const colCells = col => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, col));
const sandwiches = sandwichTotals.map((total, i) =>
  Sandwich.fromCells(total, colCells(i + 1), geometry));

return [
  new Shape('9x9'),
  ...cages,
  ...thermos,
  ...oddCircles,
  ...sandwiches,
];
