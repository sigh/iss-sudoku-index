// Title: String Theory
// Author: Chefofdeath
// Video: https://www.youtube.com/watch?v=wVLTWuJO2Wk
// Source: https://sudokupad.app/y3iozmwgi4

// Normal sudoku (rows/cols/boxes) plus one given, seven Renban lines
// (purple), and four Entropic lines (peach). Each line also carries a
// same-coloured "REN"/"ENT" text tag on one of its own cells; the tags
// restate the line's type rather than adding a constraint, so they are not
// separately encoded.

const renbanLines = [
  ['R1C6', 'R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C2'],
  ['R2C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R6C3', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
  ['R5C6', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R8C6', 'R9C6', 'R9C7', 'R9C8'],
  ['R7C6', 'R7C7', 'R7C8', 'R8C8'],
  // Closed loop: Renban constrains its cells as a set, so the wrap-around
  // edge needs no repeated first cell.
  ['R8C4', 'R9C4', 'R9C3', 'R8C3'],
];

const entropicLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C4', 'R2C5', 'R3C5', 'R4C6', 'R5C7', 'R4C8'],
  ['R1C9', 'R1C8', 'R1C7'],
  ['R5C5', 'R4C4', 'R4C3', 'R5C3', 'R5C2', 'R6C1'],
  ['R8C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  new Given('R3C6', 3),
  ...renbanLines.map((cells) => new Renban(...cells)),
  ...entropicLines.map((cells) => new Entropic(...cells)),
];
