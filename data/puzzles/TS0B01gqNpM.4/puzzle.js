// Title: May 16, 2022: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=TS0B01gqNpM
// Source: https://tinyurl.com/4nuf9rpm
//
// Normal sudoku rules apply. Numbers on each thermometer shape must increase
// along the thermometer, starting at the bulb. Thermometers C and D share
// their bulb cell (R5C5).

return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's per-cell `value`/`given` fields.
  new Given('R3C1', 8),
  new Given('R3C2', 5),
  new Given('R3C5', 6),
  new Given('R3C6', 7),
  new Given('R4C1', 2),
  new Given('R4C2', 3),
  new Given('R4C5', 8),
  new Given('R4C6', 9),
  new Given('R6C4', 6),
  new Given('R6C5', 2),
  new Given('R6C8', 9),
  new Given('R6C9', 3),
  new Given('R7C4', 1),
  new Given('R7C5', 9),
  new Given('R7C8', 4),
  new Given('R7C9', 6),

  // Thermometers, from the payload's `thermometer` array (bulb first).
  new Thermo('R1C1', 'R2C2', 'R3C3', 'R2C4', 'R1C5', 'R2C6', 'R3C7'),
  new Thermo('R7C3', 'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R8C8', 'R9C9'),
  new Thermo('R5C5', 'R4C4', 'R5C3', 'R6C2', 'R5C1'),
  new Thermo('R5C5', 'R6C6', 'R5C7', 'R4C8', 'R5C9'),
];
