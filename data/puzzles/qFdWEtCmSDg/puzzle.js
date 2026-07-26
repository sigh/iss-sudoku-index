// Title: Cornered Thermos
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=qFdWEtCmSDg
// Source: https://sudokupad.app/orrpwulfgl

// Normal sudoku rules apply (default row/column/box all-different).
// Digits along a thermometer must increase from the bulb end (Thermo, bulb
// listed first in each call).
//
// Each grid corner is a shared bulb for three 4-cell thermometers -- one
// along the row, one along the column, one along the diagonal -- matching
// the drawn lines and the shared corner circle at each bulb.

return [
  new Shape('9x9'),

  new Given('R3C6', 2),
  new Given('R3C8', 6),
  new Given('R6C5', 9),

  // Corner R1C1.
  new Thermo('R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Thermo('R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Thermo('R1C1', 'R2C2', 'R3C3', 'R4C4'),

  // Corner R1C9.
  new Thermo('R1C9', 'R1C8', 'R1C7', 'R1C6'),
  new Thermo('R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Thermo('R1C9', 'R2C8', 'R3C7', 'R4C6'),

  // Corner R9C1.
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1'),
  new Thermo('R9C1', 'R8C2', 'R7C3', 'R6C4'),

  // Corner R9C9.
  new Thermo('R9C9', 'R9C8', 'R9C7', 'R9C6'),
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Thermo('R9C9', 'R8C8', 'R7C7', 'R6C6'),
];
