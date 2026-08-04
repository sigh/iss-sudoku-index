// Title: Scooters
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=IuSWqozY82M
// Source: https://app.crackingthecryptic.com/sudoku/GtL8GpGbRJ

// Normal sudoku rules apply (default row/column/box all-different, no other
// encoding needed). Purple lines and white dots each join two adjacent cells
// whose digits are consecutive (WhiteDot). Black dots join two adjacent cells
// in a 1:2 ratio (BlackDot). The rules state "not all dots or lines are
// necessarily given", so absence of a mark carries no information: only the
// drawn marks below are constrained (StrictKropki, which would also forbid
// undrawn adjacent pairs from satisfying either relation, is not used).

// Purple lines: each connects a horizontally-adjacent pair (source: `lines`,
// colour #D23BE7/mediumorchid, thickness 13).
const purpleLines = [
  ['R1C1', 'R1C2'],
  ['R2C5', 'R2C6'],
  ['R3C3', 'R3C4'],
  ['R3C7', 'R3C8'],
  ['R5C2', 'R5C3'],
  ['R5C4', 'R5C5'],
  ['R6C7', 'R6C8'],
  ['R8C3', 'R8C4'],
  ['R8C6', 'R8C7'],
].map(cells => new WhiteDot(...cells));

// White dots: edge overlays with white fill / black border, each a
// vertically-adjacent pair (source: `overlays`, backgroundColor #FFFFFF).
const whiteDots = [
  ['R5C2', 'R6C2'],
  ['R5C3', 'R6C3'],
  ['R8C6', 'R9C6'],
  ['R8C7', 'R9C7'],
].map(cells => new WhiteDot(...cells));

// Black dots: edge overlays with black fill / black border, each a
// vertically-adjacent pair (source: `overlays`, backgroundColor #000000).
const blackDots = [
  ['R1C1', 'R2C1'],
  ['R1C2', 'R2C2'],
  ['R2C5', 'R3C5'],
  ['R2C6', 'R3C6'],
  ['R3C3', 'R4C3'],
  ['R3C4', 'R4C4'],
  ['R3C7', 'R4C7'],
  ['R3C8', 'R4C8'],
  ['R5C4', 'R6C4'],
  ['R5C5', 'R6C5'],
  ['R6C7', 'R7C7'],
  ['R6C8', 'R7C8'],
  ['R8C3', 'R9C3'],
  ['R8C4', 'R9C4'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  new Given('R7C2', 5),
  ...purpleLines,
  ...whiteDots,
  ...blackDots,
];
