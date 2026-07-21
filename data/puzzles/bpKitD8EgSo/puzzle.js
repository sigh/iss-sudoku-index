// Title: Cheese, Wine & Bread
// Author: Mr Toffee
// Video: https://www.youtube.com/watch?v=bpKitD8EgSo
// Source: https://sudokupad.app/xc7i2ozu0f

// Digits do not decrease while moving away from a bulb. Each entry is a
// non-branching segment directed from the bulb or branch junction toward a tip.
const slowThermoSegments = [
  // Green thermometer, bulb R4C3.
  ['R4C3', 'R3C2', 'R2C2'],

  // Three branches from the shared red/blue/green bulb at R7C1. The green
  // branch merges into the preceding thermometer at R3C2; its shared final
  // edge to R2C2 is already constrained above.
  ['R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C2'],
  ['R7C1', 'R7C2', 'R6C2', 'R5C2'],
  ['R7C1', 'R8C1', 'R8C2', 'R8C3', 'R7C3', 'R6C3', 'R5C3'],

  // Brown thermometer, bulb R5C4.
  ['R5C4', 'R4C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C8'],
  ['R3C6', 'R4C5'],
  ['R3C8', 'R4C7'],

  // Large yellow thermometer, bulb R6C7.
  ['R6C7', 'R5C8', 'R5C9'],
  ['R5C8', 'R6C9'],
  ['R6C7', 'R5C7', 'R4C6', 'R5C5', 'R6C4', 'R7C4', 'R8C4', 'R8C5'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C5', 'R5C6'],
  ['R6C7', 'R7C6', 'R8C6', 'R9C7'],
  ['R6C7', 'R6C8', 'R7C9', 'R8C9'],

  // Small yellow thermometer, bulb R8C8.
  ['R8C8', 'R8C7', 'R7C7', 'R7C8'],
];

const nondecreasingKey = Pair.fnToKey((bulbward, tipward) =>
  bulbward <= tipward, 9);

return [
  new Shape('9x9'),
  ...slowThermoSegments.map(cells => new Pair(
    nondecreasingKey,
    'Slow Thermometer',
    ...cells,
  )),
];
