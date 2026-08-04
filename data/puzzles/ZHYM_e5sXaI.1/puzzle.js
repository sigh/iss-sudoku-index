// Title: Felican Novjaron
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ZHYM_e5sXaI
// Source: https://tinyurl.com/wntkd3fh

// Normal sudoku rules apply. Digits along thermometers must strictly
// increase from bulb to tip. Thermometers 4-6 below share their bulb cell
// (R7C8), forming one three-armed thermometer; each arm is encoded as its
// own Thermo since they only share the low endpoint.

return [
  new Shape('9x9'),

  new Given('R1C4', 8),
  new Given('R1C8', 1),
  new Given('R2C1', 4),
  new Given('R4C9', 5),
  new Given('R6C1', 6),
  new Given('R8C9', 2),
  new Given('R9C2', 3),
  new Given('R9C6', 7),

  // Thermometers, bulb-first (from the `thermometer` array's `lines`).
  new Thermo('R4C4', 'R4C3', 'R3C2', 'R3C3', 'R3C4', 'R2C3', 'R2C2'),
  new Thermo('R7C5', 'R7C4', 'R6C3', 'R6C4', 'R6C5', 'R5C4', 'R5C3'),
  new Thermo('R5C6', 'R4C5', 'R3C5', 'R3C6', 'R4C7', 'R5C7'),
  new Thermo('R7C8', 'R8C8', 'R8C7'),
  new Thermo('R7C8', 'R7C7', 'R7C6'),
  new Thermo('R7C8', 'R6C7', 'R6C6'),
];
