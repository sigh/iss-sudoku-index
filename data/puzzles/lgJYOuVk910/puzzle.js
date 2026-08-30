// Title: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=lgJYOuVk910
// Source: https://cracking-the-cryptic.web.app/sudoku/TtTmqGMBDR

// Standard sudoku (rows, columns, boxes all-different) plus four
// thermometers; each Thermo lists cells bulb-first, so it enforces the
// strictly-increasing-from-the-bulb reading directly.

return [
  new Shape('9x9'),

  new Given('R1C2', 4),
  new Given('R1C8', 1),
  new Given('R2C1', 2),
  new Given('R2C9', 6),
  new Given('R8C1', 9),
  new Given('R8C9', 2),
  new Given('R9C2', 1),
  new Given('R9C8', 9),

  // Thermometers, each listed bulb cell first.
  new Thermo('R9C4', 'R8C3', 'R7C2', 'R6C1', 'R5C2', 'R4C3'),
  new Thermo('R4C1', 'R3C2', 'R2C3', 'R1C4', 'R2C5', 'R3C6'),
  new Thermo('R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C8', 'R6C7'),
  new Thermo('R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C5', 'R7C4'),
];
