// Title: Nov 5, 2021: Parity Lines
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=w-5nFQO26Wk
// Source: https://tinyurl.com/d8v2898c

// Normal sudoku rules, plus: for each grey line, every digit on it is odd,
// or every digit on it is even (digits may repeat along a line). Lines are
// drawn in bend order per the payload's line geometry.
const GIVENS = [
  ['R1C3', 3], ['R1C5', 2], ['R1C7', 5],
  ['R3C1', 1], ['R3C3', 2], ['R3C7', 4], ['R3C9', 7],
  ['R4C4', 1], ['R4C6', 3],
  ['R5C1', 4], ['R5C5', 5], ['R5C9', 6],
  ['R6C4', 7], ['R6C6', 9],
  ['R7C1', 3], ['R7C3', 6], ['R7C7', 8], ['R7C9', 9],
  ['R9C3', 7], ['R9C5', 8], ['R9C7', 1],
];

const LINES = [
  ['R3C6', 'R3C5', 'R3C4', 'R4C3', 'R5C3', 'R6C3'],
  ['R7C4', 'R7C5', 'R7C6', 'R6C7', 'R5C7', 'R4C7'],
  ['R2C4', 'R2C3', 'R3C2', 'R4C2'],
  ['R6C2', 'R7C2', 'R8C3', 'R8C4'],
  ['R8C6', 'R8C7', 'R7C8', 'R6C8'],
  ['R2C6', 'R2C7', 'R3C8', 'R4C8'],
];

// Each line's digits are entirely odd or entirely even: a run of one or more
// odd digits, or a run of one or more even digits, and nothing else.
const parityLines = LINES.map(
  (cells) => new Regex('[13579]+|[2468]+', ...cells));

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  ...parityLines,
];
