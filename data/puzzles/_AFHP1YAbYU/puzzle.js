// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_AFHP1YAbYU
// Source: https://cracking-the-cryptic.web.app/sudoku/4pfbdMjTjF

// The source carries no rules text. Drawn: five one-cell white circles and ten
// arrow shafts running from a circle to an arrowhead -- standard Arrow Sudoku.
// Rules encoded: normal sudoku (1-9 once per row, column and 3x3 box, supplied
// by Shape('9x9')); digits along each arrow sum to the digit in the circle the
// arrow starts from. Nothing is omitted.

// 17 givens, transcribed from the drawn cell values.
const givens = [
  ['R1C2', 1], ['R1C8', 7],
  ['R2C4', 6], ['R2C6', 8],
  ['R3C2', 6], ['R3C5', 3], ['R3C8', 9],
  ['R4C4', 5], ['R4C6', 1],
  ['R5C1', 1], ['R5C5', 2], ['R5C9', 8],
  ['R8C1', 6], ['R8C5', 8], ['R8C9', 9],
  ['R9C3', 5], ['R9C7', 7],
];

// Ten arrows, transcribed from the drawn circles and arrow strokes. Circle cell
// first, then the shaft cells in drawn order from circle to arrowhead. The five
// circles are the points of a five-pointed star and each arrow is one
// half-chord, so the five arrowhead cells are each shared by two arrows.
// Arrows 7-10 are drawn as a chain of segments ending in the head-bearing one;
// the whole chain is a single arrow.
const arrowPaths = [
  ['R4C1', 'R4C2', 'R4C3'],
  ['R2C5', 'R3C4', 'R4C3'],
  ['R2C5', 'R3C6', 'R4C7'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R4C1', 'R5C2', 'R6C3'],
  ['R4C9', 'R5C8', 'R6C7'],
  ['R9C2', 'R8C2', 'R7C3', 'R6C3'],
  ['R9C8', 'R8C8', 'R7C7', 'R6C7'],
  ['R9C2', 'R8C3', 'R8C4', 'R7C5'],
  ['R9C8', 'R8C7', 'R8C6', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrowPaths.map((path) => new Arrow(...path)),
];
