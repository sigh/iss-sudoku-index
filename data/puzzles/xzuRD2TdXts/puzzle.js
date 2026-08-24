// Title: Spoons
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=xzuRD2TdXts
// Source: https://app.crackingthecryptic.com/sudoku/BnRMNhBr8N

// Normal sudoku rules apply (grid + standard 3x3 box regions from the
// payload). Along each thermometer, digits increase from the bulb end
// (light-grey circle) to the tip. Every thermometer here is 3 cells long.
// Thermometer cell lists (bulb first) transcribed from the payload's
// `lines` waypoints, cross-checked against the `underlays` bulb circles.

return [
  new Shape('9x9'),
  new Thermo('R1C3', 'R1C4', 'R1C5'),
  new Thermo('R2C2', 'R3C2', 'R4C2'),
  new Thermo('R2C3', 'R3C3', 'R4C3'),
  new Thermo('R2C4', 'R3C4', 'R4C4'),
  new Thermo('R2C5', 'R3C5', 'R4C5'),
  new Thermo('R2C7', 'R3C7', 'R4C7'),
  new Thermo('R2C8', 'R3C8', 'R4C8'),
  new Thermo('R2C9', 'R3C9', 'R4C9'),
  new Thermo('R5C3', 'R5C4', 'R5C5'),
  new Thermo('R6C1', 'R7C1', 'R8C1'),
  new Thermo('R6C3', 'R7C3', 'R8C3'),
  new Thermo('R6C4', 'R7C4', 'R8C4'),
  new Thermo('R6C6', 'R7C6', 'R8C6'),
  new Thermo('R6C7', 'R7C7', 'R8C7'),
  new Thermo('R6C8', 'R7C8', 'R8C8'),
  new Thermo('R6C9', 'R7C9', 'R8C9'),
  new Thermo('R9C3', 'R9C4', 'R9C5'),
  new Thermo('R9C8', 'R9C7', 'R9C6'),
];
