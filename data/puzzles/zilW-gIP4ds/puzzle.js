// Title: The 17 SDG's
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=zilW-gIP4ds
// Source: https://app.crackingthecryptic.com/sudoku/3mpGprnBPF
//
// Normal sudoku rules apply (standard rows/cols/boxes). Digits increase along
// each thermometer, from the bulb end. Each Thermo below is listed bulb-first
// (its drawn bulb cell, confirmed by the grey circle overlay at that cell) in
// the order the digits must increase.

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C2', 7),
  new Given('R9C7', 1),
  new Given('R9C8', 7),

  new Thermo('R2C9', 'R2C8', 'R3C7', 'R4C7', 'R4C8', 'R4C9', 'R3C9', 'R3C8'),
  new Thermo('R6C4', 'R5C4', 'R4C4', 'R4C5', 'R5C6', 'R6C5'),
  new Thermo('R6C3', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C2', 'R8C1'),
  new Thermo('R4C1', 'R3C2', 'R2C3'),
  // Drawn tip-first (bulb overlay at R2C6, the last waypoint); reversed here.
  new Thermo('R2C6', 'R2C5', 'R2C4'),
  new Thermo('R6C9', 'R7C8', 'R8C7'),
  new Thermo('R7C6', 'R7C5', 'R7C4'),
];
