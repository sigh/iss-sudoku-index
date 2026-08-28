// Title: March 21, 2022: Dotted Lines
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Mg2cA4x92qg
// Source: https://tinyurl.com/yw4cbrzz

// Normal sudoku rules (default row/column/box all-different). A white dot
// between two orthogonally adjacent cells means those two digits are
// consecutive (WhiteDot); a black dot means one digit is double the other
// (BlackDot). The rules explicitly state not every consecutive/ratio pair
// is dotted, so no negative (StrictKropki) constraint is applied -- only
// the drawn dots are enforced.

const givens = [
  new Given('R1C1', 4), new Given('R1C9', 2),
  new Given('R2C2', 7), new Given('R2C8', 1),
  new Given('R4C4', 3),
  new Given('R5C5', 6),
  new Given('R6C6', 5),
  new Given('R8C2', 5), new Given('R8C8', 3),
  new Given('R9C1', 6), new Given('R9C9', 8),
];

// Drawn white (consecutive) dots.
const whiteDotPairs = [
  ['R2C6', 'R2C5'], ['R2C4', 'R3C4'], ['R3C4', 'R3C3'], ['R4C3', 'R3C3'],
  ['R4C2', 'R4C3'], ['R2C6', 'R3C6'], ['R3C6', 'R3C7'], ['R3C7', 'R4C7'],
  ['R4C7', 'R4C8'], ['R5C8', 'R4C8'], ['R5C3', 'R5C4'], ['R5C4', 'R6C4'],
  ['R6C4', 'R6C5'], ['R7C5', 'R6C5'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

// Drawn black (2:1 ratio) dots.
const blackDotPairs = [
  ['R6C3', 'R6C2'], ['R6C3', 'R7C3'], ['R7C4', 'R7C3'], ['R8C4', 'R7C4'],
  ['R8C6', 'R7C6'], ['R7C6', 'R7C7'], ['R6C7', 'R7C7'], ['R6C7', 'R6C8'],
  ['R8C5', 'R8C4'], ['R5C2', 'R6C2'], ['R3C5', 'R4C5'], ['R4C6', 'R4C5'],
  ['R5C6', 'R4C6'], ['R5C7', 'R5C6'],
];
const blackDots = blackDotPairs.map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
  ...blackDots,
];
