// Title: Christmas Tree
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=q7GwUW1zvhc
// Source: https://app.crackingthecryptic.com/sudoku/6pQgD6jgJn

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Green tree line: adjacent cells alternate odd/even -> Modular(2).
// Arrows: arm cells sum to the circle digit (bulb cell listed first).
// White dots ("tree lights"): each is an independent Kropki-consecutive
// edge, not a chain, so each gets its own WhiteDot pair.
// Quadruple circle ("large ornament"): digit 3 must appear in at least one
// of the surrounding 2x2 cells.
// Grey square ("tree stand"): forced to an even digit.

// Green line cells in drawn order.
const treeLine = [
  'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C2', 'R6C3', 'R5C4',
  'R5C3', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8',
  'R5C7', 'R5C6', 'R6C7', 'R7C8', 'R8C9', 'R8C8', 'R8C7', 'R8C6',
];

// White Kropki dot edges (edge-sized rounded overlay marks in the source).
const whiteDotEdges = [
  ['R8C2', 'R9C2'],
  ['R8C4', 'R9C4'],
  ['R8C7', 'R9C7'],
  ['R5C8', 'R5C9'],
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C4'],
  ['R5C1', 'R5C2'],
  ['R2C4', 'R2C5'],
  ['R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Modular(2, ...treeLine),

  // Star arrow (top).
  new Arrow('R1C5', 'R2C4', 'R3C5', 'R2C6'),
  // Garland arrows (bottom two).
  new Arrow('R3C3', 'R4C4', 'R4C5', 'R4C6', 'R3C7'),
  new Arrow('R7C7', 'R8C6', 'R7C5', 'R8C4', 'R7C3'),

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),

  // Quad circle, top-left anchor of the R3C7,R3C8,R4C7,R4C8 2x2.
  new Quad('R3C7', 3),

  // Tree stand: even digit.
  new Given('R9C5', 2, 4, 6, 8),
];
