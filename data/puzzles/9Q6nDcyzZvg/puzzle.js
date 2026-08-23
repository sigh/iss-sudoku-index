// Title: Knuckle Sandwich
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=9Q6nDcyzZvg
// Source: https://app.crackingthecryptic.com/sudoku/HRhmB9N2n6

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits along an
// arrow sum to the digit in its circle: Arrow's first cell is the bulb.
// Outside-grid clues give the sum of the digits strictly between the 1 and
// the 9 in that row/column: Sandwich.fromCells, which is direction-agnostic.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

const arrows = [
  new Arrow('R8C8', 'R8C7', 'R8C6', 'R8C5'),
  new Arrow('R7C7', 'R6C6'),
  new Arrow('R7C7', 'R7C8', 'R6C8'),
  new Arrow('R2C8', 'R3C8', 'R4C8', 'R5C8'),
  new Arrow('R3C7', 'R2C7', 'R2C6'),
  new Arrow('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Arrow('R3C3', 'R3C2', 'R4C2'),
  new Arrow('R7C3', 'R8C3', 'R8C4'),
  new Arrow('R8C2', 'R7C2', 'R6C2', 'R5C2'),
];

const sandwiches = [
  Sandwich.fromCells(8, graph.row(2), geometry),
  Sandwich.fromCells(9, graph.row(5), geometry),
  Sandwich.fromCells(5, graph.row(8), geometry),
  Sandwich.fromCells(11, graph.column(2), geometry),
  Sandwich.fromCells(14, graph.column(5), geometry),
  Sandwich.fromCells(12, graph.column(8), geometry),
];

return [
  shape,
  ...arrows,
  ...sandwiches,
];
