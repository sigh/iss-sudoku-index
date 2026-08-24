// Title: Factors Not Included
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=boeEdI_37JY
// Source: https://app.crackingthecryptic.com/sudoku/DrrJJ2tbtN

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's own
// `regions` array). Larger white circles are surrounded by factors of 12,
// i.e. the four cells touching each large circle are restricted to
// {1,2,3,4,6} (factors of 12 within 1-9), encoded as a multi-value Given
// per cell. White dots join neighbouring cells with consecutive digits
// (WhiteDot); black dots join neighbouring cells with a 1:2 ratio
// (BlackDot). "Not all dots are given" is stated explicitly, so no negative
// (un-marked-pair) constraint is added for either dot colour.

// Large white circles: five corner-anchored overlays (drawn twice the size
// of the small dot overlays) each touching a 2x2 block of four cells.
const factorCircles = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
];
const FACTORS_OF_12 = [1, 2, 3, 4, 6];
const factorGivens = factorCircles.flat()
  .filter((cell, i, arr) => arr.indexOf(cell) === i)
  .map(cell => new Given(cell, ...FACTORS_OF_12));

// White dots (consecutive): small white-filled edge overlays.
const whiteDots = [
  ['R2C2', 'R2C3'],
  ['R2C3', 'R3C3'],
  ['R3C2', 'R3C3'],
  ['R3C2', 'R4C2'],
  ['R3C1', 'R4C1'],
  ['R5C2', 'R6C2'],
  ['R8C3', 'R8C4'],
  ['R2C5', 'R3C5'],
  ['R1C4', 'R2C4'],
  ['R3C9', 'R4C9'],
  ['R5C9', 'R6C9'],
  ['R6C8', 'R6C9'],
  ['R6C7', 'R6C8'],
  ['R5C7', 'R5C8'],
  ['R8C7', 'R8C8'],
  ['R7C6', 'R8C6'],
].map(cells => new WhiteDot(...cells));

// Black dots (1:2 ratio): small black-filled edge overlays.
const blackDots = [
  ['R7C7', 'R7C8'],
  ['R1C8', 'R1C9'],
  ['R9C5', 'R9C6'],
  ['R3C5', 'R4C5'],
  ['R5C2', 'R5C3'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...factorGivens,
  ...whiteDots,
  ...blackDots,
];
