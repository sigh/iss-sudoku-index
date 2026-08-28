// Title: Partial Credit
// Author: Kusane
// Video: https://www.youtube.com/watch?v=u7tSliF5WdQ
// Source: https://sudokupad.app/cpuk8wsdg7

// Normal 9x9 sudoku rules apply; there are no givens.
//
// The 21 killer cages are drawn as outlines that do not follow cell borders: an
// outline may cut a cell in half, in quarters, or diagonally.  A cage's digits
// must sum to its printed total, each digit counting only the fraction of its
// cell's area that lies inside the cage (an 8 in a half-enclosed cell adds 4).
// Digits may repeat inside a cage, so this is a plain weighted sum, not a
// killer cage's all-different.
//
// Cage table transcribed from the 21 closed outlines in the puzzle's line layer
// and the 21 totals printed at their top-left corners.  `share` is the enclosed
// fraction of that cell, measured in sixteenths of a cell: every enclosed
// fraction in the puzzle is a whole number of sixteenths (1/16, 1/8, 1/4, 1/2,
// 11/16, 3/4, or a whole cell).
const SIXTEENTHS = 16;
const cages = [
  { total: 7,      cells: [['R1C4', 16], ['R2C4', 16], ['R2C5', 4]] },
  { total: 10,     cells: [['R1C6', 12], ['R1C7', 8], ['R2C6', 8]] },
  { total: 9,      cells: [['R1C6', 4], ['R1C7', 8], ['R2C6', 8], ['R2C7', 8]] },
  { total: 12,     cells: [['R2C3', 16], ['R3C3', 12], ['R3C4', 4]] },
  { total: 5.5,    cells: [['R2C7', 4], ['R2C8', 16], ['R2C9', 16]] },
  { total: 16,     cells: [['R3C6', 8], ['R4C6', 16], ['R4C7', 16]] },
  { total: 9,      cells: [['R4C4', 8], ['R5C4', 8], ['R6C4', 8]] },
  { total: 11,     cells: [['R4C8', 16], ['R5C8', 8], ['R6C8', 8]] },
  { total: 2.5,    cells: [['R4C2', 4], ['R4C3', 2]] },
  { total: 9,      cells: [['R5C7', 16], ['R5C8', 8], ['R6C7', 8], ['R6C8', 8]] },
  { total: 3.5,    cells: [['R5C1', 11], ['R6C1', 4]] },
  { total: 10.375, cells: [['R4C3', 2], ['R5C3', 16], ['R5C4', 1]] },
  { total: 2.5,    cells: [['R5C6', 4], ['R6C6', 8]] },
  { total: 3.5,    cells: [['R7C6', 8], ['R7C7', 8]] },
  { total: 4.5,    cells: [['R7C8', 16], ['R7C9', 8]] },
  { total: 4,      cells: [['R7C6', 4], ['R8C6', 8]] },
  { total: 3.5,    cells: [['R7C6', 4], ['R7C7', 4], ['R8C6', 4]] },
  { total: 2.5,    cells: [['R7C7', 2], ['R8C7', 4], ['R8C8', 2]] },
  { total: 9,      cells: [['R8C1', 16], ['R8C2', 16], ['R8C3', 8]] },
  { total: 3,      cells: [['R8C4', 16], ['R9C4', 8]] },
  { total: 4,      cells: [['R8C3', 4], ['R9C3', 16], ['R9C4', 8]] },
];

// Sum's coefficients and total must be integers, so each cage equation is
// stated in sixteenths of a digit: sum(share_i * d_i) = 16 * total.  Every
// printed total is a whole number of sixteenths, so no cage loses precision.
const fractionalCages = cages.map(
  ({ total, cells }) => new Sum(total * SIXTEENTHS, ...cells));

return [
  new Shape('9x9'),
  ...fractionalCages,
];
