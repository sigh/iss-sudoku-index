// Title: May 22, 2022: Consec Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=6oz1O-Cp95Q
// Source: https://tinyurl.com/2da8vbvc

// Normal sudoku rules apply. Numbers in cells connected by a white dot must
// be consecutive (WhiteDot: Kropki white dot, adjacent cells only). "Not all
// such pairs are necessarily marked" means undrawn adjacent pairs are
// unconstrained, so no negative/exhaustive constraint is added for unmarked
// edges.

const givens = [
  new Given('R1C2', 6),
  new Given('R1C8', 2),
  new Given('R2C1', 7),
  new Given('R2C9', 6),
  new Given('R8C1', 4),
  new Given('R8C9', 2),
  new Given('R9C2', 8),
  new Given('R9C8', 4),
];

// White (Kropki) dots, transcribed from the puzzle's drawn dot markers.
const dots = [
  ['R9C4', 'R9C5'],
  ['R9C5', 'R9C6'],
  ['R8C6', 'R9C6'],
  ['R1C5', 'R1C6'],
  ['R1C5', 'R1C4'],
  ['R2C4', 'R1C4'],
  ['R4C9', 'R5C9'],
  ['R6C9', 'R5C9'],
  ['R4C8', 'R4C9'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
  ['R6C1', 'R6C2'],
  ['R5C4', 'R5C5'],
  ['R5C5', 'R5C6'],
  ['R4C6', 'R5C6'],
  ['R5C4', 'R6C4'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...dots,
];
