// Title: Orientation
// Author: zetamath
// Video: https://www.youtube.com/watch?v=CKHnlFksvXI
// Source: https://sudokupad.app/so6t07h4yh

// Normal sudoku rules apply.
//
// Rossini: an arrow just outside a row or column shows the direction in
// which the three digits nearest the arrow increase (pointing into the
// grid means the nearest digit is smallest; pointing away from the grid
// means the nearest digit is largest). If a row or column end has no
// arrow, the three digits nearest that end must NOT be increasing or
// decreasing: the middle digit must be the largest or smallest of the
// three.
//
// GreaterThan(...) is used along each triple: passing cells from largest
// to smallest enforces a strictly decreasing chain across the triple,
// which also encodes an increasing chain when the cells are passed in the
// opposite order.
//
// The "no arrow" triples are encoded as: either the middle cell is
// greater than both neighbours, or it is less than both neighbours.
function peakOrValley(a, b, c) {
  return new Or([
    new And([new GreaterThan(b, a), new GreaterThan(b, c)]),
    new And([new GreaterThan(a, b), new GreaterThan(c, b)]),
  ]);
}

return [
  new Shape('9x9'),

  new Given('R2C2', 5),
  new Given('R3C2', 6),
  new Given('R5C6', 8),
  new Given('R6C5', 3),
  new Given('R6C8', 9),

  // Row left-edge arrows.
  new GreaterThan('R2C3', 'R2C2', 'R2C1'),
  new GreaterThan('R3C3', 'R3C2', 'R3C1'),
  new GreaterThan('R5C3', 'R5C2', 'R5C1'),
  new GreaterThan('R6C1', 'R6C2', 'R6C3'),
  new GreaterThan('R7C3', 'R7C2', 'R7C1'),

  // Row right-edge arrows.
  new GreaterThan('R2C7', 'R2C8', 'R2C9'),
  new GreaterThan('R3C7', 'R3C8', 'R3C9'),
  new GreaterThan('R5C9', 'R5C8', 'R5C7'),
  new GreaterThan('R7C7', 'R7C8', 'R7C9'),
  new GreaterThan('R9C7', 'R9C8', 'R9C9'),

  // Column bottom-edge arrows.
  new GreaterThan('R7C1', 'R8C1', 'R9C1'),
  new GreaterThan('R9C5', 'R8C5', 'R7C5'),
  new GreaterThan('R7C8', 'R8C8', 'R9C8'),

  // Column top-edge arrows.
  new GreaterThan('R1C6', 'R2C6', 'R3C6'),
  new GreaterThan('R1C9', 'R2C9', 'R3C9'),

  // Row ends with no arrow.
  peakOrValley('R1C1', 'R1C2', 'R1C3'),
  peakOrValley('R1C7', 'R1C8', 'R1C9'),
  peakOrValley('R4C1', 'R4C2', 'R4C3'),
  peakOrValley('R4C7', 'R4C8', 'R4C9'),
  peakOrValley('R8C1', 'R8C2', 'R8C3'),
  peakOrValley('R8C7', 'R8C8', 'R8C9'),
  peakOrValley('R9C1', 'R9C2', 'R9C3'),
  peakOrValley('R6C7', 'R6C8', 'R6C9'),

  // Column ends with no arrow.
  peakOrValley('R1C1', 'R2C1', 'R3C1'),
  peakOrValley('R1C2', 'R2C2', 'R3C2'),
  peakOrValley('R7C2', 'R8C2', 'R9C2'),
  peakOrValley('R1C3', 'R2C3', 'R3C3'),
  peakOrValley('R7C3', 'R8C3', 'R9C3'),
  peakOrValley('R1C4', 'R2C4', 'R3C4'),
  peakOrValley('R7C4', 'R8C4', 'R9C4'),
  peakOrValley('R1C5', 'R2C5', 'R3C5'),
  peakOrValley('R7C6', 'R8C6', 'R9C6'),
  peakOrValley('R1C7', 'R2C7', 'R3C7'),
  peakOrValley('R7C7', 'R8C7', 'R9C7'),
  peakOrValley('R1C8', 'R2C8', 'R3C8'),
  peakOrValley('R7C9', 'R8C9', 'R9C9'),
];
