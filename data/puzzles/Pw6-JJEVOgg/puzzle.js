// Title: Dots
// Author: AlbinS
// Video: https://www.youtube.com/watch?v=Pw6-JJEVOgg
// Source: https://app.crackingthecryptic.com/sudoku/366Pj32HbT
//
// Normal sudoku rules (standard 3x3 boxes, default row/col/box all-different).
// White dots (WhiteDot) join cells with consecutive digits; black dots
// (BlackDot) join cells with a 1:2 ratio. Both are drawn on adjacent cell
// pairs (payload edge overlays, fill #ffffff = white, fill #000000 = black).
//
// "Not all dots are given" (rules text) rules out the exhaustive/negative
// reading (StrictKropki): an unmarked adjacent pair carries no constraint, so
// only the drawn dots below are encoded.

// White dot pairs (consecutive), from the payload's edge overlays.
const whiteDotPairs = [
  ['R1C1', 'R1C2'],
  ['R1C1', 'R2C1'],
  ['R1C2', 'R1C3'],
  ['R1C3', 'R2C3'],
  ['R3C2', 'R3C3'],
  ['R1C5', 'R2C5'],
  ['R4C8', 'R4C9'],
  ['R4C7', 'R4C8'],
  ['R4C6', 'R5C6'],
  ['R5C6', 'R6C6'],
  ['R8C7', 'R8C8'],
  ['R9C7', 'R9C8'],
  ['R9C8', 'R9C9'],
  ['R8C6', 'R9C6'],
  ['R8C4', 'R9C4'],
  ['R7C4', 'R8C4'],
  ['R6C1', 'R7C1'],
  ['R5C1', 'R6C1'],
];

// Black dot pairs (1:2 ratio), from the payload's edge overlays.
const blackDotPairs = [
  ['R6C2', 'R7C2'],
  ['R8C3', 'R8C4'],
  ['R8C4', 'R8C5'],
  ['R5C5', 'R6C5'],
  ['R5C5', 'R5C6'],
  ['R3C5', 'R3C6'],
  ['R2C7', 'R3C7'],
  ['R3C8', 'R3C9'],
  ['R4C8', 'R5C8'],
];

const whiteDots = whiteDotPairs.map(cells => new WhiteDot(...cells));
const blackDots = blackDotPairs.map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...whiteDots,
  ...blackDots,
];
