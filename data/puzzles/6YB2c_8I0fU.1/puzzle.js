// Title: GAK
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=6YB2c_8I0fU
// Source: https://app.crackingthecryptic.com/sudoku/fFfbTFNfL2

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Digits joined by a black dot are in a 2:1 ratio; digits joined by a white
// dot are consecutive. "All dots may not be given" means the drawn dots are
// not exhaustive, so no negative/StrictKropki inference applies to unmarked
// adjacent pairs -- only the drawn dots below are constrained.

// Dot cell pairs transcribed from the drawn overlays, split by fill colour
// (white fill = consecutive, black fill = ratio).
const whiteDotPairs = [
  ['R2C3', 'R3C3'], ['R6C3', 'R7C3'], ['R7C2', 'R8C2'], ['R8C2', 'R9C2'],
  ['R9C3', 'R9C4'], ['R7C5', 'R8C5'], ['R6C5', 'R6C6'], ['R4C4', 'R4C5'],
  ['R2C5', 'R3C5'], ['R1C6', 'R1C7'], ['R1C8', 'R1C9'], ['R1C8', 'R2C8'],
  ['R2C8', 'R3C8'], ['R3C7', 'R4C7'], ['R4C7', 'R4C8'],
];

const blackDotPairs = [
  ['R5C9', 'R6C9'], ['R4C8', 'R4C9'], ['R3C7', 'R3C8'], ['R1C7', 'R1C8'],
  ['R7C7', 'R8C7'], ['R7C6', 'R7C7'], ['R5C5', 'R5C6'], ['R5C4', 'R5C5'],
  ['R1C6', 'R2C6'], ['R2C5', 'R2C6'], ['R3C3', 'R3C4'], ['R4C1', 'R5C1'],
  ['R6C1', 'R6C2'], ['R6C2', 'R6C3'], ['R7C2', 'R7C3'], ['R9C1', 'R9C2'],
  ['R9C2', 'R9C3'], ['R8C4', 'R9C4'], ['R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...whiteDotPairs.map(cells => new WhiteDot(...cells)),
  ...blackDotPairs.map(cells => new BlackDot(...cells)),
];
