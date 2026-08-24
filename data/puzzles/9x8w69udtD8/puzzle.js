// Title: Bubble Bath
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=9x8w69udtD8
// Source: https://app.crackingthecryptic.com/sudoku/G9mBNJr24F

// Normal sudoku rules apply (standard rows/cols/boxes, from the payload's
// ordinary nine-box regions). A grey bubble on a cell means that digit is
// odd; there is no dedicated Odd class, so it is a multi-value Given.
// A white bubble between two cells means they are consecutive (WhiteDot); a
// black bubble means a 1:2 ratio (BlackDot). "Not all bubbles are given"
// rules out the exhaustive negative reading (StrictKropki): an unmarked
// adjacent pair carries no constraint.

// Cell pairs transcribed from the payload's white-fill overlays (28 dots).
const whiteDotPairs = [
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'],
  ['R3C3', 'R3C4'], ['R3C3', 'R4C3'],
  ['R4C2', 'R4C3'], ['R4C3', 'R5C3'],
  ['R5C1', 'R5C2'],
  ['R5C3', 'R5C4'], ['R5C4', 'R6C4'],
  ['R6C4', 'R7C4'], ['R6C4', 'R6C5'],
  ['R6C5', 'R7C5'], ['R6C5', 'R6C6'],
  ['R5C6', 'R5C7'], ['R4C6', 'R5C6'],
  ['R4C5', 'R4C6'], ['R4C4', 'R4C5'],
  ['R3C5', 'R4C5'], ['R3C6', 'R4C6'],
  ['R5C7', 'R6C7'], ['R6C7', 'R7C7'], ['R6C7', 'R6C8'],
  ['R7C6', 'R7C7'],
  ['R8C4', 'R9C4'], ['R8C5', 'R9C5'],
  ['R8C2', 'R8C3'],
  ['R5C8', 'R5C9'],
  ['R8C8', 'R8C9'],
];

// Cell pairs transcribed from the payload's black-fill overlays (5 dots).
const blackDotPairs = [
  ['R2C7', 'R2C8'], ['R2C8', 'R2C9'],
  ['R8C6', 'R8C7'], ['R9C6', 'R9C7'],
  ['R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),

  // Grey bubble cells (underlays at R1C2, R1C5, R1C8): digit must be odd.
  new Given('R1C2', 1, 3, 5, 7, 9),
  new Given('R1C5', 1, 3, 5, 7, 9),
  new Given('R1C8', 1, 3, 5, 7, 9),

  ...whiteDotPairs.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotPairs.map(([a, b]) => new BlackDot(a, b)),
];
