// Title: Lockout Lines turn 4
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=YC7dPnq8bcM
// Source: https://sudokupad.app/u0cs9m2qmx

// Digits inside each line lie outside the inclusive range of its diamond endpoints;
// the endpoint digits differ by at least 4.
const lockoutLines = [
  [
    'R4C2', 'R3C2', 'R2C3', 'R3C4', 'R2C5', 'R3C6', 'R2C7', 'R3C8',
    'R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C6', 'R7C5', 'R8C4', 'R7C3',
    'R6C2',
  ],
  [
    'R4C7', 'R4C6', 'R3C5', 'R4C4', 'R4C3', 'R5C3', 'R6C3', 'R7C4',
    'R6C5', 'R7C6', 'R6C7',
  ],
  ['R1C3', 'R2C4', 'R1C5', 'R2C6', 'R1C7'],
  ['R9C6', 'R8C5', 'R9C4'],
];

return [
  new Shape('9x9'),
  new Given('R1C2', 8),
  new Given('R1C6', 2),
  new Given('R1C9', 4),
  new Given('R2C2', 6),
  new Given('R2C8', 9),
  new Given('R5C4', 7),
  new Given('R6C9', 6),
  new Given('R7C1', 6),
  new Given('R8C7', 4),
  new Given('R8C8', 6),
  new Given('R9C3', 2),
  ...lockoutLines.map(cells => new Lockout(4, ...cells)),
];
