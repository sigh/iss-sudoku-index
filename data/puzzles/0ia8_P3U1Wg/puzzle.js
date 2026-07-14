// Title: Green-Tree
// Author: jreboot
// Video: https://www.youtube.com/watch?v=0ia8_P3U1Wg
// Source: https://sudokupad.app/19gptz1pi2

// German whisper: 5 separate green lines, adjacent digits differ by >= 5
// (Whisper's default difference).
const whispers = [
  ['R8C3', 'R8C2', 'R8C1', 'R7C2'],
  ['R6C3', 'R6C2', 'R6C1', 'R5C2', 'R4C3', 'R4C4'],
  ['R3C4', 'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C7'],
  ['R4C6', 'R4C7', 'R5C8', 'R6C9', 'R6C8', 'R6C7', 'R6C6'],
  ['R7C8', 'R8C9', 'R8C8', 'R8C7'],
].map(cells => new Whisper(...cells));

// Thermo: one thermometer, bulb at R7C6, strictly increasing to the tip
// at R7C4.
const thermo = new Thermo('R7C6', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4');

// Odd Circle: 9 cells marked with a grey circle must hold an odd digit.
// Some sit on a whisper line, others (R7C7, R9C1, R3C6) are standalone
// cells with no other drawn geometry.
const oddCells = [
  'R1C5', 'R6C1', 'R6C9', 'R4C3', 'R4C7', 'R7C7', 'R3C4', 'R9C1', 'R3C6',
];
const oddGivens = oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9));

return [
  new Shape('9x9'),
  ...whispers,
  thermo,
  ...oddGivens,
];
