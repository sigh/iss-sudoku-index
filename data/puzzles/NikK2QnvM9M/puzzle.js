// Title: Fireworks
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=NikK2QnvM9M
// Source: https://app.crackingthecryptic.com/sudoku/FPPb3T2JqT

// Normal sudoku (default 3x3 boxes). Two thermometers increase from their
// bulb. Each thermometer's tip cell is also drawn as a ringed arrow circle
// ("firework"); 7 arrows radiate from it in the compass directions not
// already covered by the thermometer line, each arrow's two arm cells
// summing to the circle's digit. The drawn straight-line arrows fix each
// arrow's arm cells; the thermometer occupies the one remaining compass
// direction at each circle.

const thermoA = new Thermo('R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3');
const thermoB = new Thermo('R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7');

// Circle at R3C3: 7 arrows (Arrow takes the circle cell first, then arms).
const arrowsA = [
  new Arrow('R3C3', 'R2C3', 'R1C3'), // up
  new Arrow('R3C3', 'R3C4', 'R3C5'), // right
  new Arrow('R3C3', 'R3C2', 'R3C1'), // left
  new Arrow('R3C3', 'R2C2', 'R1C1'), // up-left
  new Arrow('R3C3', 'R2C4', 'R1C5'), // up-right
  new Arrow('R3C3', 'R4C2', 'R5C1'), // down-left
  new Arrow('R3C3', 'R4C4', 'R5C5'), // down-right
];

// Circle at R4C7: 7 arrows.
const arrowsB = [
  new Arrow('R4C7', 'R4C6', 'R4C5'), // left
  new Arrow('R4C7', 'R3C7', 'R2C7'), // up
  new Arrow('R4C7', 'R4C8', 'R4C9'), // right
  new Arrow('R4C7', 'R3C6', 'R2C5'), // up-left
  new Arrow('R4C7', 'R3C8', 'R2C9'), // up-right
  new Arrow('R4C7', 'R5C6', 'R6C5'), // down-left
  new Arrow('R4C7', 'R5C8', 'R6C9'), // down-right
];

return [
  new Shape('9x9'),
  new Given('R6C5', 1),
  new Given('R6C7', 6),
  new Given('R7C1', 8),
  new Given('R8C2', 1),
  thermoA,
  thermoB,
  ...arrowsA,
  ...arrowsB,
];
