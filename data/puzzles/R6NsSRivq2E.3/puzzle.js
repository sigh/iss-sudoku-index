// Title: 7/29/22: I'm A Man, I'm 40
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=R6NsSRivq2E
// Source: https://tinyurl.com/yckwcmxm
//
// Normal sudoku rules apply. Digits along each thermometer must strictly
// increase from the bulb (round end) to the tip; Thermo(...) takes cells in
// that order and enforces exactly this.
//
// Thermometers A, B, C, and F all share the same bulb cell, R5C3 -- the
// puzzle draws four separate thermometers radiating from one round end, each
// encoded as its own Thermo.

return [
  new Shape('9x9'),

  new Given('R1C6', 7),
  new Given('R1C7', 2),
  new Given('R1C8', 9),
  new Given('R9C5', 7),
  new Given('R9C6', 2),
  new Given('R9C7', 9),

  // A: bulb R5C3
  new Thermo('R5C3', 'R5C2', 'R5C1', 'R4C1', 'R3C1', 'R2C1'),
  // B: bulb R5C3
  new Thermo('R5C3', 'R4C3', 'R3C3', 'R2C3'),
  // C: bulb R5C3
  new Thermo('R5C3', 'R6C3', 'R7C3', 'R8C3'),
  // D: bulb R5C6
  new Thermo('R5C6', 'R4C6', 'R3C6', 'R2C7', 'R2C8', 'R3C9', 'R4C9'),
  // E: bulb R5C9
  new Thermo('R5C9', 'R6C9', 'R7C9', 'R8C8', 'R8C7', 'R7C6', 'R6C6'),
  // F: bulb R5C3
  new Thermo('R5C3', 'R5C4', 'R5C5'),
];
