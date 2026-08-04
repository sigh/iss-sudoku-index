// Title: Seven Fish Pie
// Author: Full Deck & Missing a Few Cards
// Video: https://www.youtube.com/watch?v=C1jOI3gBnV4
// Source: https://app.crackingthecryptic.com/sudoku/2N2TgTPLjf
//
// Normal sudoku rules apply. Green lines: adjacent digits differ by at least
// 5 (Whisper). Purple lines: digits form a consecutive set in any order
// (Renban). The grey line is a thermometer, increasing from the bulb
// (Thermo). White dots join consecutive digits; black dots join digits in a
// 2:1 ratio. The rules state dots are not exhaustive, so no negative
// constraint is added for undotted pairs.

const purpleLines = [
  ['R1C8', 'R1C7', 'R2C6', 'R1C6', 'R2C7'],
  ['R2C4', 'R2C3', 'R3C2', 'R2C2', 'R3C3'],
  ['R5C7', 'R5C6', 'R6C5', 'R5C5', 'R6C6'],
  ['R7C3', 'R7C2', 'R8C1', 'R7C1', 'R8C2'],
];

const greenLines = [
  ['R3C9', 'R4C8', 'R4C7', 'R3C7', 'R3C8', 'R4C9'],
  ['R5C3', 'R6C2', 'R6C1', 'R5C1', 'R5C2', 'R6C3'],
];

// Grey thermometer: bulb at R8C5 (matches the filled grey circle overlay),
// increasing along the drawn path.
const thermo = ['R8C5', 'R7C6', 'R8C7', 'R9C8', 'R8C8', 'R9C7', 'R9C6', 'R9C5'];

// White dots (consecutive), one edge each -- from the small white-filled
// rounded overlays.
const whiteDots = [
  ['R8C4', 'R9C4'],
  ['R7C4', 'R7C5'],
  ['R7C7', 'R7C8'],
  ['R4C1', 'R4C2'],
  ['R4C2', 'R4C3'],
  ['R3C3', 'R4C3'],
  ['R3C2', 'R3C3'],
  ['R1C5', 'R2C5'],
  ['R2C6', 'R3C6'],
];

// Black dots (2:1 ratio), one edge each -- from the small black-filled
// rounded overlays.
const blackDots = [
  ['R3C1', 'R3C2'],
  ['R3C1', 'R4C1'],
  ['R5C3', 'R5C4'],
  ['R6C3', 'R6C4'],
  ['R7C9', 'R8C9'],
  ['R8C2', 'R8C3'],
];

return [
  new Shape('9x9'),

  ...purpleLines.map((cells) => new Renban(...cells)),
  ...greenLines.map((cells) => new Whisper(5, ...cells)),
  new Thermo(...thermo),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
