// Title: patreon.com/svencodes
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=z-nWoY9yqRs
// Source: https://tinyurl.com/mujv62k6

// Normal sudoku rules apply. Digits on a thermometer must strictly increase
// as they move away from the bulb; each Thermo's first argument is the bulb.
// Cell lists below are transcribed from the drawn thermometer lines.
// Thermometers 5 and 6 are separate lines that merge into a shared tail
// (R6C4-R5C5-R4C6-R3C7) from different bulbs.

const thermos = [
  new Thermo('R3C4', 'R2C3', 'R1C2'),
  new Thermo('R2C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R4C2', 'R5C3'),
  new Thermo('R8C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C8', 'R5C7'),
  new Thermo('R7C6', 'R8C7', 'R9C8'),
  new Thermo('R6C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),
  new Thermo('R7C4', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 1),
  new Given('R3C5', 1),
  new Given('R7C5', 9),
  new Given('R9C1', 8),
  ...thermos,
];
