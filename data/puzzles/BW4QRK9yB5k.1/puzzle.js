// Title: August 30th, 2022: GAS
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=BW4QRK9yB5k
// Source: https://tinyurl.com/5n8k3n3z

// Normal sudoku rules apply. Digits along each thermometer strictly increase
// from the round bulb (first cell listed) to the far end.

const givens = [
  new Given('R2C2', 7),
  new Given('R2C5', 2),
  new Given('R2C8', 1),
  new Given('R5C2', 8),
  new Given('R5C5', 1),
  new Given('R5C8', 3),
  new Given('R8C2', 6),
  new Given('R8C5', 9),
  new Given('R8C8', 2),
];

// Provenance: coordinates transcribed from the drawn thermometers; bulb is
// the first cell of each line.
const thermometers = [
  new Thermo('R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'),
  new Thermo('R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'),
  new Thermo('R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'),
  new Thermo('R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
];
