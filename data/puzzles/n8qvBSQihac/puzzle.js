// Title: 2023
// Author: Nikoleta
// Video: https://www.youtube.com/watch?v=n8qvBSQihac
// Source: https://app.crackingthecryptic.com/sudoku/dJDQdR78HL

// Normal sudoku rules apply (default row/col/box all-different; the drawn
// regions are the ordinary 3x3 boxes). Cages: distinct digits summing to the
// stated total. Thermometers: strictly increasing away from the bulb.
//
// Both drawn thermometer strokes pass through their bulb cell rather than
// starting at it, so each is really one bulb with two arms; each arm is its
// own Thermo(bulb, ..., tip), sharing the bulb (and, for the second
// thermometer, the R5C3 stem) cell with its sibling arm.

const cages = [
  [23, 'R1C1', 'R2C1', 'R3C1', 'R4C1'],
  [23, 'R5C1', 'R5C2', 'R5C3', 'R6C2'],
  [23, 'R6C3', 'R7C3', 'R8C3', 'R9C3'],
  [23, 'R6C4', 'R7C4', 'R7C5'],
  [23, 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  [23, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [23, 'R1C6', 'R2C5', 'R2C6', 'R3C5'],
  [23, 'R1C7', 'R2C7', 'R3C7', 'R4C7'],
  [23, 'R4C8', 'R5C7', 'R5C8', 'R5C9'],
  [23, 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  [23, 'R1C8', 'R2C8', 'R2C9', 'R3C8'],
];

return [
  new Shape('9x9'),

  new Given('R2C4', 4),
  new Given('R2C6', 8),
  new Given('R4C1', 1),
  new Given('R5C5', 9),
  new Given('R6C7', 2),
  new Given('R8C2', 3),
  new Given('R8C4', 1),
  new Given('R9C5', 5),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  // Bulb at R2C2, forking into two arms.
  new Thermo('R2C2', 'R2C3', 'R1C3', 'R1C2'),
  new Thermo('R2C2', 'R3C2', 'R3C3'),

  // Bulb at R5C2, stem to R5C3, forking into two arms from there.
  new Thermo('R5C2', 'R5C3', 'R4C3', 'R4C2'),
  new Thermo('R5C2', 'R5C3', 'R6C3', 'R6C2'),
];
