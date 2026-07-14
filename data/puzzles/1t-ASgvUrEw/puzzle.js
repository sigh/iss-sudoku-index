// Title: Broken Windmill
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=1t-ASgvUrEw
// Source: https://sudokupad.app/1qkwdlzd2p

// Normal sudoku rules apply (rows, columns, 3x3 boxes). No givens.
//
// Arrows: digits along an arrow sum to the digit in its circle
//   (circled cell first, then the arm cells).
//
// Double arrows: digits on the line between two circles sum to the total of
//   the two circled digits (first and last cells are the circles). All four
//   double arrows here run straight through the centre cell R5C5, forming a
//   windmill: the main diagonal, the anti-diagonal, the middle column and the
//   middle row.
const arrows = [
  ['R5C8', 'R6C7', 'R6C8', 'R6C9'],
  ['R2C5', 'R3C6', 'R2C7'],
  ['R5C2', 'R4C3', 'R3C2'],
  ['R8C5', 'R7C4', 'R8C3'],
];

const doubleArrows = [
  // Main diagonal.
  ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'],
  // Anti-diagonal.
  ['R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  // Middle column.
  ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'],
  // Middle row.
  ['R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8'],
];

return [
  new Shape('9x9'),

  ...arrows.map(cells => new Arrow(...cells)),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),
];
