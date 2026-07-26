// Title: A Phistful of Circles
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=o_SjZuwprU0
// Source: https://sudokupad.app/qg411d1jf2

// Rules: normal sudoku; a circled digit tells how many circles (across the
// whole grid) contain that digit; a purple line's digits are a
// non-repeating consecutive set in any order (Renban); a green line's
// adjacent digits differ by >= 5 (German whisper); a red line's digits
// alternate odd/even.

// Circle cells (drawn as white-fill/black-border circles).
// One global counting-circle set: the digit shown in each circled cell must
// equal the number of circled cells (of the 30 below) holding that digit.
const circleCells = [
  'R1C1', 'R1C2', 'R1C8', 'R1C9',
  'R2C1', 'R2C2', 'R2C9',
  'R3C3', 'R3C4', 'R3C5', 'R3C6',
  'R4C3', 'R4C7',
  'R5C3', 'R5C7',
  'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
  'R8C1', 'R8C2', 'R8C8', 'R8C9',
  'R9C1', 'R9C2', 'R9C8', 'R9C9',
];

// Purple lines: consecutive, non-repeating, any order.
const purpleLines = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R8C5', 'R8C6'],
  ['R8C9', 'R9C9', 'R9C8'],
];

// Green lines: adjacent difference >= 5.
const greenLines = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R1C6', 'R2C7'],
  ['R4C2', 'R5C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R5C8', 'R5C9'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
];

// Red lines: alternating odd/even. Two entries are closed loops
// (R5C6-R4C5-R5C4-R6C5-R5C6, and R8C1-R8C2-R9C2-R9C1-R8C1); the second is
// drawn as two touching strokes in slightly different reds that share
// endpoints R8C1/R9C2, and no rule names a second red hue, so both are
// merged into one closed loop here. Closed-loop cell lists repeat the first
// cell at the end so the wrap-around pair is also constrained.
const redLines = [
  ['R1C5', 'R2C5'],
  ['R3C8', 'R4C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R5C6', 'R4C5', 'R5C4', 'R6C5', 'R5C6'],
  ['R8C1', 'R8C2', 'R9C2', 'R9C1', 'R8C1'],
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];
const charClass = (values) => `[${values.join('')}]`;
// Full sequence is either odd/even/odd/... or even/odd/even/...
const alternatingParity =
  `(${charClass(ODD)}${charClass(EVEN)})*${charClass(ODD)}?` +
  `|(${charClass(EVEN)}${charClass(ODD)})*${charClass(EVEN)}?`;

return [
  new Shape('9x9'),

  new CountingCircles(...circleCells),

  ...purpleLines.map((cells) => new Renban(...cells)),
  ...greenLines.map((cells) => new Whisper(5, ...cells)),
  ...redLines.map((cells) => new Regex(alternatingParity, ...cells)),
];
