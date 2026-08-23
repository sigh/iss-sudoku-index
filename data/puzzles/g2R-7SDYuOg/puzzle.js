// Title: Trapezoids
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=g2R-7SDYuOg
// Source: https://app.crackingthecryptic.com/sudoku/8DgD33JtBt

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Green line: digits along it alternate odd/even, in the drawn waypoint
// order (some consecutive pairs are orthogonal, some corner-diagonal).
// Black dots: the two cells are in a 2:1 ratio.
// White dots: the two cells differ by 1.
// "Not all black and white dots are shown" means only the drawn dots are
// constraints -- no exhaustive/negative reading is encoded.

const greenLine = [
  'R4C6', 'R3C7', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8',
  'R9C8', 'R8C7', 'R7C6', 'R6C6', 'R5C6', 'R5C5', 'R5C4', 'R4C4', 'R3C4',
  'R2C3', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2',
  'R7C3', 'R6C4',
];

// Kropki white dots (difference of 1), one per drawn edge.
const whiteDotEdges = [
  ['R1C8', 'R1C9'], ['R2C8', 'R2C9'], ['R2C7', 'R3C7'], ['R4C9', 'R5C9'],
  ['R5C8', 'R5C9'], ['R5C7', 'R5C8'], ['R6C5', 'R6C6'], ['R5C5', 'R5C6'],
  ['R4C4', 'R4C5'], ['R1C4', 'R1C5'], ['R3C2', 'R4C2'], ['R4C2', 'R5C2'],
  ['R7C3', 'R8C3'], ['R7C1', 'R8C1'], ['R8C1', 'R8C2'], ['R9C1', 'R9C2'],
];

// Kropki black dots (2:1 ratio), one per drawn edge.
const blackDotEdges = [
  ['R9C6', 'R9C7'], ['R8C6', 'R9C6'], ['R7C8', 'R8C8'], ['R4C6', 'R5C6'],
  ['R5C4', 'R6C4'], ['R1C3', 'R1C4'],
];

return [
  new Shape('9x9'),
  new Modular(2, ...greenLine),
  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
];
