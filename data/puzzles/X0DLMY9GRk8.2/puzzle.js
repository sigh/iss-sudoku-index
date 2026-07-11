// Title: 1 Quiver and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=X0DLMY9GRk8
// Source: https://sudokupad.app/c7jl019y8w

// Irregular Sudoku: place 1-6 once each in every row, column, and irregular
// region (no standard 2x3 boxes). Six regions, recovered from the raw
// SudokuMaker `regions` array (0-indexed [row, col] pairs).
//
// Arrows: digits on an arrow sum to the digit in the circle attached to that
// arrow. Circle/bulb cells come from the source's circle markers and
// poly-line arrow waypoints, snapped to cell centres.

const shape = '6x6';

const regions = [
  ['R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C4'],
  ['R3C1', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R5C2', 'R5C3', 'R5C5', 'R6C3', 'R6C4', 'R6C5'],
  ['R3C5', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R5C4'],
  ['R2C5', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C4'],
];

// [circleCell, ...bulbCells] for each arrow, circle-first as drawn.
const arrows = [
  ['R2C4', 'R3C5'],
  ['R3C1', 'R4C2'],
  ['R6C1', 'R6C2', 'R5C3'],
  ['R1C2', 'R2C3', 'R3C3'],
  ['R4C4', 'R5C5', 'R6C5'],
];

return [
  new Shape(shape),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw(shape, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
