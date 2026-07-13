// Title: Quivers
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=N4LskHYSfCg
// Source: https://sudokupad.app/d6pi3xs4wu

// Normal sudoku rules apply. Adjacent digits along an orange line have a
// difference of at least four. Digits on an arrow sum to the digit in the
// circle of that arrow.

// Orange lines: adjacent cells along the line differ by at least 4.
const LINES = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R4C2', 'R4C3', 'R3C3', 'R2C3', 'R1C3'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R3C4', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R3C6'],
  [
    'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6',
    'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R7C6',
  ],
  ['R9C3', 'R8C3', 'R7C3', 'R6C3'],
];

// Arrows: bulb cell first, then the arm cells whose sum equals the bulb.
const ARROWS = [
  ['R4C2', 'R3C2', 'R2C2'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R7C5', 'R6C5', 'R5C5'],
  ['R8C9', 'R8C8', 'R8C7'],
  ['R9C2', 'R8C2', 'R7C2'],
];

return [
  new Shape('9x9'),
  new Given('R7C5', 9),
  new Given('R9C2', 9),
  ...LINES.map(line => new Whisper(4, ...line)),
  ...ARROWS.map(arrow => new Arrow(...arrow)),
];
