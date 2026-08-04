// Title: Dec. 7, 2022: Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=3Onsq24T0Ug
// Source: https://tinyurl.com/38phx685

// Normal sudoku rules apply. Six thermometers: digits strictly increase
// (not necessarily consecutively) from the round bulb to the tip.
// `Thermo` enforces strict increase starting from its first argument, so
// each thermometer's cells are listed bulb-first per the payload's line
// order.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 3),
  new Given('R3C3', 5),
  new Given('R4C4', 4),
  new Given('R4C6', 2),
  new Given('R5C5', 8),
  new Given('R6C4', 5),
  new Given('R6C6', 6),
  new Given('R7C7', 4),
  new Given('R9C9', 2),

  // Thermometers, bulb-first.
  new Thermo('R1C4', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C1', 'R4C1'),
  new Thermo('R9C6', 'R9C7', 'R8C7', 'R8C8', 'R7C8', 'R7C9', 'R6C9'),
  new Thermo('R2C6', 'R3C6', 'R3C7', 'R4C7', 'R4C8'),
  new Thermo('R8C4', 'R7C4', 'R7C3', 'R6C3', 'R6C2'),
  new Thermo('R1C8', 'R1C9', 'R2C9'),
  new Thermo('R9C2', 'R9C1', 'R8C1'),
];
