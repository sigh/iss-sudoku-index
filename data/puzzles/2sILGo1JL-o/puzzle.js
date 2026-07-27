// Title: Arrow Thermo 2
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=2sILGo1JL-o
// Source: https://sudokupad.app/mzabnx43dl

// Normal sudoku rules apply. Along a thermometer, digits increase from the
// bulb end (Thermo's first cell). Digits along an arrow sum to the digit in
// that arrow's circle (Arrow's first cell).
//
// The payload draws each thermometer/arrow pair as two circle marks sharing
// a line-endpoint cell: a filled grey underlay (no border) at one end and a
// white circle with a border (overlay) at the other. Those match ISS's own
// display markers for the two classes -- Thermo uses a full/filled circle at
// its bulb (start), Arrow uses an empty/outlined circle at its control cell
// (start) -- so the grey underlay end is each thermometer's bulb and the
// white-bordered overlay end is the corresponding arrow's circle.

const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
];

// Each arrow's first cell is its circle; the rest is the summed arm. Every
// circle cell is the bottom cell of one of the thermometers above.
const arrows = [
  ['R5C1', 'R6C1', 'R7C1', 'R8C1'],
  ['R6C3', 'R7C3', 'R8C3'],
  ['R7C5', 'R8C4', 'R9C4'],
  ['R7C5', 'R8C6', 'R9C6'], // shares its circle with the arrow above.
  ['R6C7', 'R7C7', 'R8C7'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  new Given('R5C4', 1),
  new Given('R9C3', 7),
  new Given('R9C6', 2),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
