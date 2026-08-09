// Title: August 20, 2022: Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=VGVN2oFFXnM
// Source: https://tinyurl.com/2p87mdy7

// Normal sudoku rules apply. Digits along a thermometer must increase (not
// necessarily consecutively), starting from the round bulb (Thermo(bulb, ...)
// enforces strictly increasing values from its first argument). Thermometer
// cell paths transcribed from the drawn `lines` overlay; the four givens are
// off any thermometer.

return [
  new Shape('9x9'),

  new Given('R4C5', 5),
  new Given('R5C4', 1),
  new Given('R5C6', 9),
  new Given('R6C5', 6),

  new Thermo('R4C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3'),
  new Thermo('R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8'),
  new Thermo('R2C6', 'R1C6', 'R1C5', 'R1C4', 'R2C4', 'R3C4'),
  new Thermo('R7C6', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4'),
  new Thermo('R6C7', 'R5C7', 'R5C8'),
  new Thermo('R5C2', 'R5C3', 'R4C3'),
  new Thermo('R2C7', 'R3C7', 'R3C6', 'R3C5', 'R2C5'),
  new Thermo('R8C5', 'R7C5', 'R7C4', 'R7C3', 'R8C3'),
  new Thermo('R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1'),
  new Thermo('R2C1', 'R2C2', 'R1C2'),
  new Thermo('R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7'),
  new Thermo('R9C8', 'R8C8', 'R8C9'),
];
