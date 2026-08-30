// Title: Chinese New Year Sudoku
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=1keM956qflM
// Source: https://cracking-the-cryptic.web.app/sudoku/bMjgt78j6g
//
// Standard sudoku (rows, columns, boxes). Five thermometer lines: digits
// strictly increase along each line starting from its round-bulb end. The
// bulb at R4C4 is shared by two arms (a Y-shaped thermometer); both arms
// increase independently away from the shared bulb, so they are two Thermo
// constraints sharing a first cell.

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C1', 2),
  new Given('R3C5', 1),
  new Given('R3C8', 4),
  new Given('R4C1', 3),
  new Given('R4C8', 7),
  new Given('R7C8', 1),
  new Given('R8C2', 4),
  new Given('R8C9', 6),
  new Given('R9C1', 7),
  new Given('R9C4', 5),

  // Thermometers (bulb cell first).
  // T1: bent, bulb R1C3.
  new Thermo('R1C3', 'R2C3', 'R3C2'),
  // T2: Y-shaped, bulb R4C4 shared by two arms.
  new Thermo('R4C4', 'R5C4'),
  new Thermo('R4C4', 'R4C5', 'R4C6', 'R4C7'),
  // T3: bulb R3C6.
  new Thermo('R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'),
  // T4: bulb R6C2.
  new Thermo('R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'),
  // T5: bulb R2C4.
  new Thermo('R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'),
];
