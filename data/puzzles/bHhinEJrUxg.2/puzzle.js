// Title: TOWTCBBAR
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=bHhinEJrUxg
// Source: https://tinyurl.com/nasejkyv

// Normal sudoku. 10 lines, each with a hollow circle at both ends. On each
// line: interior digits are strictly between the two circled values
// (Between), and the whole line including the two circled ends is a set of
// consecutive digits with no repeats, in any order (Renban).

const shape = new Shape('9x9');

// Given digits.
const givens = [
  new Given('R2C2', 2),
  new Given('R2C6', 5),
  new Given('R3C3', 3),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C7', 7),
  new Given('R8C4', 5),
];

// The 10 drawn between-lines, cell order as drawn (first/last cell circled).
const lines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3'],
  ['R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3'],
  ['R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['R4C5', 'R4C6', 'R4C7'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R4C3', 'R5C4', 'R6C5'],
];

const betweens = lines.map(cells => new Between(...cells));
const renbans = lines.map(cells => new Renban(...cells));

return [
  shape,
  ...givens,
  ...betweens,
  ...renbans,
];
