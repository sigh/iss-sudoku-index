// Title: Feb 15, 2022: Kropki Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=lDlym71OqIg
// Source: https://tinyurl.com/mvckjbn4

// Normal sudoku rules apply (rows, columns and boxes all-different --
// standard for a plain 9x9 Shape). Black dot: adjacent cells in a 1:2 ratio
// (BlackDot). White dot: adjacent cells consecutive (WhiteDot). "Not all
// dots are given" is stated explicitly, so this is plain BlackDot/WhiteDot
// with no StrictKropki negative over the rest of the grid. Two givens.

// Black dots (payload's `ratio` array).
const blackDots = [
  ['R2C2', 'R2C3'],
  ['R2C3', 'R2C4'],
  ['R2C4', 'R2C5'],
  ['R8C2', 'R8C3'],
  ['R5C5', 'R5C6'],
  ['R5C6', 'R5C7'],
  ['R5C7', 'R5C8'],
  ['R3C1', 'R4C1'],
  ['R3C9', 'R4C9'],
  ['R3C4', 'R4C4'],
  ['R4C1', 'R4C2'],
  ['R8C1', 'R8C2'],
  ['R1C6', 'R1C7'],
  ['R1C7', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R7C4', 'R7C5'],
];

// White dots (payload's `difference` array).
const whiteDots = [
  ['R2C7', 'R2C8'],
  ['R2C8', 'R2C9'],
  ['R8C7', 'R8C8'],
  ['R8C6', 'R8C7'],
  ['R8C5', 'R8C6'],
  ['R5C3', 'R5C4'],
  ['R5C4', 'R5C5'],
  ['R5C2', 'R5C3'],
  ['R6C9', 'R7C9'],
  ['R6C1', 'R7C1'],
  ['R6C6', 'R7C6'],
  ['R6C8', 'R6C9'],
  ['R9C3', 'R9C4'],
  ['R9C2', 'R9C3'],
  ['R9C1', 'R9C2'],
  ['R3C5', 'R3C6'],
];

return [
  new Shape('9x9'),
  new Given('R2C6', 3),
  new Given('R8C4', 5),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
