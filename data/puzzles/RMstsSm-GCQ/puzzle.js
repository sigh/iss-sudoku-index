// Title: Kropki's Ladder
// Author: GavinR
// Video: https://www.youtube.com/watch?v=RMstsSm-GCQ
// Source: https://app.crackingthecryptic.com/sudoku/TLFpbFMRN3

// Normal sudoku rules apply (standard 3x3 boxes, no other geometry).
// A white dot between two orthogonally adjacent cells means the two cells
// hold consecutive digits; a black dot means one digit is double the other.
// Per the rules text ("Not all dots are given") absence of a dot carries no
// information, so no negative/exhaustive-marking constraint is added.

// White dots, read from the payload's edge-centred white-filled overlay
// marks.
const whiteDots = [
  ['R1C9', 'R2C9'], ['R2C4', 'R2C5'], ['R2C8', 'R2C9'], ['R2C8', 'R3C8'],
  ['R3C7', 'R3C8'], ['R3C7', 'R4C7'], ['R4C6', 'R4C7'], ['R4C6', 'R5C6'],
  ['R5C4', 'R5C5'], ['R5C4', 'R6C4'], ['R5C5', 'R5C6'], ['R5C9', 'R6C9'],
  ['R6C3', 'R6C4'], ['R6C3', 'R7C3'], ['R7C2', 'R7C3'], ['R7C2', 'R8C2'],
  ['R7C4', 'R7C5'], ['R8C1', 'R8C2'], ['R8C1', 'R9C1'],
];

// Black dots, read from the payload's edge-centred black-filled overlay
// marks.
const blackDots = [
  ['R3C3', 'R3C4'], ['R3C3', 'R4C3'], ['R6C2', 'R6C3'], ['R6C7', 'R7C7'],
  ['R7C6', 'R7C7'], ['R7C6', 'R8C6'], ['R8C6', 'R8C7'], ['R8C7', 'R9C7'],
  ['R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  new Given('R4C9', 4),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
