// Title: Heatwave
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=1ApDRSPPpvg
// Source: https://tinyurl.com/2zs9wn7v

// Normal sudoku rules apply. Each of the 8 thermometers below must strictly
// increase in value from its bulb (first cell) to its far end, which is
// exactly Thermo's semantics. Cell paths transcribed from the source's
// `thermometer` line lists.

const givens = [
  new Given('R1C3', 2), new Given('R1C6', 9),
  new Given('R2C1', 1), new Given('R2C5', 4),
  new Given('R3C1', 3),
  new Given('R7C9', 7),
  new Given('R8C5', 6), new Given('R8C9', 9),
  new Given('R9C4', 9), new Given('R9C7', 8),
];

const thermos = [
  new Thermo('R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3'),
  new Thermo('R2C3', 'R2C4', 'R3C4', 'R4C4', 'R4C5'),
  new Thermo('R3C5', 'R3C6', 'R4C6', 'R5C6', 'R5C7'),
  new Thermo('R4C7', 'R4C8', 'R5C8', 'R6C8', 'R6C9'),
  new Thermo('R7C7', 'R7C8', 'R8C8', 'R9C8', 'R9C9'),
  new Thermo('R6C5', 'R6C6', 'R7C6', 'R8C6', 'R8C7'),
  new Thermo('R5C3', 'R5C4', 'R6C4', 'R7C4', 'R7C5'),
  new Thermo('R4C1', 'R4C2', 'R5C2', 'R6C2', 'R6C3'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
