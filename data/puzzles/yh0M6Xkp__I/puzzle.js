// Title: Honeymoon
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=yh0M6Xkp__I
// Source: https://app.crackingthecryptic.com/sudoku/9m49Nhhbff

// Standard 9x9 sudoku (rows, columns, boxes) plus:
// - One thermometer: digits increase from the bulb (Thermo's own semantics).
// - Seven green lines: adjacent digits on each line differ by at least 5
//   (Whisper's own semantics with the default difference of 5).
// The drawn strokes bend, including through diagonally adjacent cells; the
// cell lists below follow the drawn path rather than assuming straight rays.

// Thermometer: bulb (grey circle) at R4C5. Path bends diagonally
// R4C5-R5C4 and R6C5-R5C6.
const THERMO_CELLS = ['R4C5', 'R5C4', 'R6C4', 'R6C5', 'R5C6'];

// Green difference lines. Each is an independent line; adjacent-pair
// difference >= 5 applies within each line separately.
const WHISPER_LINES = [
  ['R1C3', 'R1C2', 'R2C1', 'R3C1'],
  ['R7C1', 'R8C1'],
  ['R9C1', 'R8C2'],
  ['R9C2', 'R9C3'],
  ['R9C7', 'R9C8', 'R8C9', 'R7C9'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
  // Closed loop (20 distinct cells): first cell repeated at the end so the
  // wrap-around edge R3C6/R2C7 is also constrained.
  ['R2C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3', 'R4C3', 'R4C4', 'R5C5', 'R6C6',
   'R7C6', 'R8C6', 'R9C5', 'R9C6', 'R8C7', 'R7C7', 'R7C8', 'R6C7', 'R5C7',
   'R4C6', 'R3C6', 'R2C7'],
];

const whispers = WHISPER_LINES.map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Thermo(...THERMO_CELLS),
  ...whispers,
];
