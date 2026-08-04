// Title: 4/12/23: Summetric Placement
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=z-nWoY9yqRs
// Source: https://tinyurl.com/37p3e9zx

// Standard Sudoku, default 3x3 boxes, no givens.
// Region Sum Lines: equal sum within each box segment a line passes through.
// RegionSumLine takes the ordered path and splits it by box crossing itself.
// Kropki Pairs: white dot = consecutive (WhiteDot), black dot = ratio 2:1
// (BlackDot). Rules state dots are not exhaustively marked, so no negative
// constraint is added; unmarked adjacent pairs may still be consecutive or
// 2:1.

// Region sum lines, one ordered path per drawn line (regionsumline).
const regionSumLines = [
  ['R4C1', 'R4C2', 'R3C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R6C9', 'R6C8', 'R7C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R4C7', 'R4C8'],
  ['R9C5', 'R9C4', 'R9C3', 'R8C3', 'R7C3', 'R6C3', 'R6C2'],
  ['R8C1', 'R7C1', 'R6C1'],
  ['R4C9', 'R3C9', 'R2C9'],
].map(cells => new RegionSumLine(...cells));

// White (consecutive) dots, one edge per drawn dot (difference).
const whiteDots = [
  ['R4C1', 'R4C2'],
  ['R8C4', 'R8C5'],
  ['R8C5', 'R8C6'],
  ['R9C4', 'R9C5'],
  ['R6C3', 'R7C3'],
  ['R1C7', 'R2C7'],
  ['R4C5', 'R5C5'],
  ['R4C4', 'R4C5'],
].map(cells => new WhiteDot(...cells));

// Black (2:1 ratio) dots, one edge per drawn dot (ratio).
const blackDots = [
  ['R6C8', 'R6C9'],
  ['R2C4', 'R2C5'],
  ['R2C5', 'R2C6'],
  ['R1C5', 'R1C6'],
  ['R3C7', 'R4C7'],
  ['R8C3', 'R9C3'],
  ['R5C5', 'R6C5'],
  ['R6C5', 'R6C6'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...regionSumLines,
  ...whiteDots,
  ...blackDots,
];
