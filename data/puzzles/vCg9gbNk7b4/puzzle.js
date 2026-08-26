// Title: Thermo Bunches
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=vCg9gbNk7b4
// Source: https://sudokupad.app/zrk69de373

// Normal sudoku rules (rows, columns, boxes) plus 12 thermometers; digits
// strictly increase from the bulb end of each. Bulb ends taken from the
// round marker drawn on each line in the source payload.

return [
  new Shape('9x9'),

  new Given('R2C7', 2),
  new Given('R8C4', 4),

  new Thermo('R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Thermo('R5C1', 'R4C2', 'R3C3', 'R2C4'),
  new Thermo('R6C1', 'R5C2', 'R4C3', 'R3C4'),
  new Thermo('R7C1', 'R6C2', 'R5C3', 'R4C4'),
  new Thermo('R8C1', 'R7C2', 'R6C3'),
  new Thermo('R9C1', 'R8C2', 'R7C3'),
  new Thermo('R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5'),
  new Thermo('R6C9', 'R7C8', 'R8C7', 'R9C6'),
  new Thermo('R5C9', 'R6C8', 'R7C7', 'R8C6'),
  new Thermo('R4C9', 'R5C8', 'R6C7', 'R7C6'),
  new Thermo('R3C9', 'R4C8', 'R5C7'),
  new Thermo('R2C9', 'R3C8', 'R4C7'),
];
