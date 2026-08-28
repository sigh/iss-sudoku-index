// Title: Thermo Sudoku - Our New App!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=va3xrk7YALo
// Source: https://cracking-the-cryptic.web.app/sudoku/hpJ7Qh4m82

// Standard sudoku (rows, columns, boxes) plus three thermometers: digits
// strictly increase along each line starting from its round bulb end.

const givens = [
  new Given('R2C9', 8),
  new Given('R3C1', 5),
  new Given('R4C5', 2),
  new Given('R6C5', 7),
  new Given('R7C9', 6),
  new Given('R8C1', 6),
];

// Bulb cell first in each Thermo; bulb identified by the underlay circle at
// the line's first waypoint (R2C8, R3C2, R8C8).
const thermometers = [
  new Thermo('R2C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2'),
  new Thermo('R3C2', 'R4C3', 'R4C4', 'R5C5', 'R6C6', 'R6C7', 'R7C8'),
  new Thermo('R8C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C2'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
];
