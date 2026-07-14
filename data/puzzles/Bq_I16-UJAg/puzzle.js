// Title: December Colors
// Author: Walter Gronholm
// Video: https://www.youtube.com/watch?v=Bq_I16-UJAg
// Source: https://sudokupad.app/j9xc6ud326

// Normal sudoku. White dots: consecutive. Black dots: 1:2 ratio.
// "No negative constraint applies" -- only the drawn dots are guaranteed;
// unmarked adjacent pairs are not restricted, so no negative constraint is
// added for either colour.

const whiteDots = [
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
  ['R6C2', 'R6C3'],
  ['R5C6', 'R5C7'],
];

const blackDots = [
  ['R2C1', 'R2C2'],
  ['R1C3', 'R2C3'],
  ['R2C3', 'R3C3'],
  ['R2C5', 'R3C5'],
  ['R2C6', 'R3C6'],
  ['R3C7', 'R4C7'],
  ['R1C8', 'R2C8'],
  ['R4C4', 'R5C4'],
  ['R6C3', 'R6C4'],
  ['R8C2', 'R8C3'],
  ['R7C4', 'R7C5'],
  ['R7C5', 'R7C6'],
  ['R7C7', 'R7C8'],
  ['R8C7', 'R8C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C9', 5),
  new Given('R9C1', 7),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
