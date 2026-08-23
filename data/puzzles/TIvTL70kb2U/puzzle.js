// Title: Number Crunch
// Author: tallcat
// Video: https://www.youtube.com/watch?v=TIvTL70kb2U
// Source: https://app.crackingthecryptic.com/sudoku/m9P9N9DLFh

// Normal sudoku rules apply (default 3x3 boxes; regions array matches them).
// Each purple line is a set of non-repeating consecutive digits in any order
// -> Renban. Digits along an arrow sum to the digit in that arrow's circle
// -> Arrow (bulb first, then arm cells). Each of the four drawn circles is
// the shared bulb of two separate arrows (a long one to a grid corner and a
// short one-cell arrow); both are encoded independently.

const renbans = [
  ['R3C4', 'R3C5', 'R3C6', 'R4C5'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R7C6', 'R7C5', 'R7C4'],
  ['R4C3', 'R5C3', 'R6C3', 'R5C4'],
  ['R1C4', 'R2C5', 'R1C6'],
  ['R4C8', 'R4C9', 'R3C9'],
  ['R8C4', 'R9C4'],
  ['R9C6', 'R9C7'],
  ['R5C5', 'R5C6'],
].map((cells) => new Renban(...cells));

const arrows = [
  ['R3C7', 'R2C8', 'R2C9', 'R1C9'],
  ['R3C3', 'R2C2', 'R1C2', 'R1C1'],
  ['R7C3', 'R8C2', 'R8C1', 'R9C1'],
  ['R7C7', 'R8C8', 'R9C8', 'R9C9'],
  ['R7C3', 'R6C4'],
  ['R3C3', 'R4C4'],
  ['R3C7', 'R4C6'],
  ['R7C7', 'R6C6'],
].map((cells) => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Given('R1C8', 3),
  ...renbans,
  ...arrows,
];
