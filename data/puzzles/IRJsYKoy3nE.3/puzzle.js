// Title: 5/5: The Arrow of Hat Time
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=IRJsYKoy3nE
// Source: https://tinyurl.com/ye2yy7zk

// Normal sudoku rules apply. Digits along each arrow must sum to its
// circled total. 16 of the 18 circles carry a printed given digit; the
// remaining two (R6C3, R4C7) have no given digit, so Arrow alone pins
// their totals.

// Givens transcribed from the payload's cell grid; every given cell is
// also an arrow's circle (see the ARROWS table below).
const givens = [
  new Given('R1C1', 3), new Given('R1C5', 4), new Given('R1C6', 7),
  new Given('R1C8', 9), new Given('R1C9', 5),
  new Given('R2C1', 9),
  new Given('R4C1', 8),
  new Given('R5C1', 7), new Given('R5C9', 8),
  new Given('R6C9', 7),
  new Given('R8C9', 9),
  new Given('R9C1', 5), new Given('R9C2', 9), new Given('R9C4', 4),
  new Given('R9C5', 7), new Given('R9C9', 3),
];

// Each entry is [circle, ...arm], transcribed from the drawn arrow shafts
// (each shaft's first cell is the circle). Arrow(circle, ...arm) enforces
// circle = sum(arm).
const ARROWS = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R9C2', 'R8C2', 'R7C2'],
  ['R9C4', 'R8C4', 'R7C4'],
  ['R9C5', 'R8C5', 'R7C5'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R8C9', 'R8C8', 'R8C7'],
  ['R6C9', 'R6C8', 'R6C7'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R6C3', 'R7C3', 'R8C3'],
  ['R4C7', 'R3C7', 'R2C7'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...ARROWS.map(([circle, ...arm]) => new Arrow(circle, ...arm)),
];
