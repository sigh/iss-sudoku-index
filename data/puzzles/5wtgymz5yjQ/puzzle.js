// Title: Checkerboard
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=5wtgymz5yjQ
// Source: https://app.crackingthecryptic.com/sudoku/3GtDr9bTRb

// Normal sudoku rules apply (standard rows/cols/3x3 boxes, from the default
// Shape). Along each thermometer, digits increase from the bulb end
// (Thermo lists cells starting at the bulb, per its constructor contract).
// The grey circle underlays only mark each thermometer's bulb cell; the
// rules text gives them no separate meaning, so they are not encoded beyond
// choosing the bulb-first cell order below.

return [
  new Shape('9x9'),

  new Given('R4C5', 9),
  new Given('R4C7', 1),
  new Given('R5C5', 1),
  new Given('R6C1', 8),
  new Given('R9C1', 9),

  new Thermo('R2C2', 'R1C1'),
  new Thermo('R2C4', 'R1C3'),
  new Thermo('R2C6', 'R1C7'),
  new Thermo('R2C8', 'R1C9'),
  new Thermo('R4C2', 'R3C1'),
  new Thermo('R4C4', 'R3C3'),
  new Thermo('R4C6', 'R3C7'),
  new Thermo('R4C8', 'R3C9'),
  new Thermo('R6C2', 'R7C1'),
  new Thermo('R8C2', 'R9C1'),
  new Thermo('R6C4', 'R7C3'),
  new Thermo('R8C4', 'R9C3'),
  new Thermo('R6C6', 'R7C7'),
  new Thermo('R6C8', 'R7C9'),
  new Thermo('R8C6', 'R9C7'),
  new Thermo('R8C8', 'R9C9'),
];
