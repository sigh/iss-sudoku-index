// Title: 22/2/22: Kropnosis
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5KkjaYmgOBc
// Source: https://tinyurl.com/yckwsv2x

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). No given digits.
//
// White dots: the joined cells hold consecutive digits (WhiteDot).
// Black dots: the joined cells hold a 2:1 ratio (BlackDot).
// The rules state explicitly that not every dot need be shown ("All dots
// may not be given"), so no StrictKropki negative is encoded.

// White dot edges, from the payload's `difference` array (all default value 1).
const whiteDots = [
  ['R3C5', 'R4C5'], ['R4C4', 'R4C5'], ['R5C4', 'R4C4'], ['R5C3', 'R5C4'],
  ['R6C4', 'R5C4'], ['R6C6', 'R6C7'], ['R5C7', 'R6C7'], ['R4C2', 'R3C2'],
  ['R4C1', 'R4C2'], ['R7C2', 'R8C2'], ['R9C3', 'R8C3'], ['R3C7', 'R2C7'],
  ['R1C6', 'R2C6'], ['R8C8', 'R8C9'],
];

// Black dot edges, from the payload's `ratio` array (all default value 2).
const blackDots = [
  ['R4C6', 'R5C6'], ['R4C6', 'R4C5'], ['R7C5', 'R6C5'], ['R7C6', 'R7C5'],
  ['R2C4', 'R1C4'], ['R2C4', 'R2C3'], ['R3C3', 'R2C3'], ['R3C2', 'R3C3'],
  ['R4C1', 'R5C1'], ['R7C1', 'R6C1'], ['R7C1', 'R7C2'], ['R8C2', 'R8C3'],
  ['R4C8', 'R5C8'], ['R4C8', 'R4C9'], ['R3C8', 'R4C8'], ['R2C7', 'R2C6'],
  ['R7C9', 'R8C9'], ['R9C8', 'R9C7'], ['R5C5', 'R5C6'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
