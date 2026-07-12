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

// The "no arrow" ends are the same peakOrValley template stamped onto every
// row-triple (horizontal) and column-triple (vertical) whose end lacks an
// arrow. Each is a pure translation of one template, so Replicate applies:
// one group per orientation (offset direction).
const graph = cellGraph('9x9');

const horizNoArrowStarts = [
  'R1C1', 'R1C7', 'R4C1', 'R4C7', 'R8C1', 'R8C7', 'R9C1', 'R6C7',
];
const vertNoArrowStarts = [
  'R1C1', 'R1C2', 'R7C2', 'R1C3', 'R7C3', 'R1C4', 'R7C4',
  'R1C5', 'R7C6', 'R1C7', 'R7C7', 'R1C8', 'R7C9',
];

const horizNoArrow = new Replicate(
  [peakOrValley('R1C1', 'R1C2', 'R1C3')],
  Replicate.encodeTargetCells(horizNoArrowStarts, 'R1C1', graph),
  'R1C1',
);
const vertNoArrow = new Replicate(
  [peakOrValley('R1C1', 'R2C1', 'R3C1')],
  Replicate.encodeTargetCells(vertNoArrowStarts, 'R1C1', graph),
  'R1C1',
);

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

  // Row ends with no arrow (horizontal row-triples).
  horizNoArrow,

  // Column ends with no arrow (vertical column-triples).
  vertNoArrow,
];
