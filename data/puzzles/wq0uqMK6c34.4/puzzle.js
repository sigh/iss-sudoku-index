// Title: 1/29/23: 2 Tortilla Chips
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=wq0uqMK6c34
// Source: https://tinyurl.com/2jmtspy5

// Normal sudoku (default row/column/box all-different). Kropki dots: a white
// dot (WhiteDot) between adjacent cells requires the two digits to be
// consecutive (differ by 1); a black dot (BlackDot) requires a 2:1 ratio.
// The rules explicitly state there is no negative constraint, so adjacent
// pairs without a drawn dot are unrestricted -- only the dot lists below are
// encoded.

const givens = [
  new Given('R3C3', 1), new Given('R3C4', 3), new Given('R3C5', 5),
  new Given('R4C7', 9),
  new Given('R5C3', 9), new Given('R5C4', 1), new Given('R5C6', 5), new Given('R5C7', 7),
  new Given('R6C3', 7),
  new Given('R7C5', 9), new Given('R7C6', 7), new Given('R7C7', 5),
];

// White dots (consecutive), from the payload's `difference` array.
const whiteDots = [
  ['R2C2', 'R2C3'], ['R3C2', 'R4C2'], ['R4C3', 'R4C4'],
  ['R5C1', 'R5C2'], ['R6C1', 'R7C1'], ['R6C4', 'R6C5'],
  ['R7C2', 'R7C3'], ['R7C4', 'R8C4'], ['R8C5', 'R8C6'],
].map(cells => new WhiteDot(...cells));

// Black dots (2:1 ratio), from the payload's `ratio` array.
const blackDots = [
  ['R2C4', 'R2C5'], ['R2C6', 'R3C6'], ['R3C7', 'R3C8'],
  ['R3C9', 'R4C9'], ['R4C5', 'R4C6'], ['R5C8', 'R5C9'],
  ['R6C6', 'R6C7'], ['R6C8', 'R7C8'], ['R8C7', 'R8C8'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
  ...blackDots,
];
