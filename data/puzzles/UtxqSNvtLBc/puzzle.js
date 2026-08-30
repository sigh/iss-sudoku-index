// Title: Unknown
// Author: Rishi Puri
// Video: https://www.youtube.com/watch?v=UtxqSNvtLBc
// Source: https://cracking-the-cryptic.web.app/sudoku/THRr76Qgjr

// Normal sudoku rules apply (default row/col/box all-different; the
// payload's 9 regions coincide with the default 3x3 boxes). No givens.
// Full Kropki: a white dot means the pair is consecutive, a black dot means
// one digit is double the other, and every pair satisfying either relation
// is marked (including the 1/2 edge case, which may show as either colour)
// -- StrictKropki below. The payload's overlay list draws only black dots
// (fillColor #000000); no white dots appear anywhere in the grid.

// Black dots: 1:2 ratio. Edges transcribed from the payload's overlay list
// (fillColor #000000, edge-sized rounded marks).
const blackDots = [
  ['R2C3', 'R3C3'], ['R1C4', 'R1C5'], ['R2C5', 'R3C5'], ['R1C9', 'R2C9'],
  ['R2C8', 'R3C8'], ['R4C9', 'R5C9'], ['R4C7', 'R4C8'], ['R4C6', 'R4C7'],
  ['R4C6', 'R5C6'], ['R5C6', 'R6C6'], ['R6C4', 'R6C5'], ['R6C2', 'R6C3'],
  ['R5C2', 'R6C2'], ['R4C1', 'R5C1'], ['R8C2', 'R9C2'], ['R8C3', 'R8C4'],
  ['R7C4', 'R8C4'], ['R7C4', 'R7C5'], ['R7C6', 'R7C7'], ['R7C7', 'R8C7'],
  ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  new StrictKropki(),
];
