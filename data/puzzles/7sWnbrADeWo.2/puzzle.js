// Title: August 22, 2021: Kropki Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=7sWnbrADeWo
// Source: https://tinyurl.com/4mem88z4
//
// Normal sudoku rules apply. Digits on either side of a white dot must be
// consecutive; digits on either side of a black dot must be in a 1:2 ratio.
// Not all dots are necessarily given, so the absence of a dot between two
// adjacent cells carries no information (StrictKropki does not apply).

const givens = [
  new Given('R3C3', 2),
  new Given('R3C5', 4),
  new Given('R3C7', 6),
  new Given('R7C3', 4),
  new Given('R7C5', 6),
  new Given('R7C7', 8),
];

// White dots (consecutive pairs). Drawn `difference` cages, all with default
// (unstated) value, which is 1 -- consecutive.
const whiteDots = [
  ['R3C3', 'R4C3'], ['R3C5', 'R4C5'], ['R3C7', 'R4C7'],
  ['R4C6', 'R4C5'], ['R4C6', 'R4C7'], ['R4C5', 'R4C4'], ['R4C3', 'R4C4'],
  ['R6C3', 'R7C3'], ['R6C5', 'R7C5'], ['R6C7', 'R7C7'],
  ['R6C4', 'R6C3'], ['R6C5', 'R6C4'], ['R6C6', 'R6C5'], ['R6C6', 'R6C7'],
  ['R5C3', 'R5C4'], ['R5C6', 'R5C7'], ['R5C8', 'R5C7'], ['R5C2', 'R5C3'],
  ['R3C1', 'R4C1'], ['R6C9', 'R7C9'], ['R1C8', 'R1C9'],
  ['R9C1', 'R9C2'], ['R1C6', 'R1C5'], ['R9C4', 'R9C5'],
].map(cells => new WhiteDot(...cells));

// Black dots (1:2 ratio pairs). Drawn `ratio` cages, all with default
// (unstated) value, which is 2 -- 1:2 ratio.
const blackDots = [
  ['R4C1', 'R5C1'], ['R6C9', 'R5C9'], ['R4C9', 'R3C9'], ['R6C1', 'R7C1'],
  ['R1C1', 'R2C1'], ['R9C9', 'R8C9'], ['R1C7', 'R1C8'], ['R9C2', 'R9C3'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
  ...blackDots,
];
