// Title: Critical Mass
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=GljZsflgPss
// Source: https://tinyurl.com/tc-critmass

// Normal sudoku rules apply (standard 3x3 boxes, no jigsaw).
//
// Between lines (grey, filled-circle endpoints): digits strictly between the
// two endpoint circles must lie strictly between the two circles' values.
// `Between(...cells)` treats the first and last cell as the circles.
//
// Renban lines (pink): digits on a line form a set of consecutive,
// non-repeating digits, in any order.
//
// Cell paths below are transcribed from the puzzle's drawn between/renban
// line geometry.

const betweenLines = [
  ['R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8'],
  ['R8C3', 'R7C4', 'R7C5', 'R7C6', 'R8C7'],
  ['R2C3', 'R3C4', 'R3C5', 'R3C6', 'R2C7'],
];

const renbanLines = [
  ['R3C3', 'R4C2', 'R5C2', 'R6C2', 'R7C3'],
  ['R3C7', 'R4C8', 'R5C8', 'R6C8', 'R7C7'],
  ['R5C3', 'R4C3', 'R4C4'],
  ['R6C6', 'R6C7', 'R5C7'],
  ['R5C4', 'R4C5'],
  ['R5C6', 'R6C5'],
  ['R8C5', 'R9C5'],
  ['R2C4', 'R2C5', 'R2C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 1),
  new Given('R9C1', 2),
  new Given('R9C9', 3),

  ...betweenLines.map((cells) => new Between(...cells)),
  ...renbanLines.map((cells) => new Renban(...cells)),
];
