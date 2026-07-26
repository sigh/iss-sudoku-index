// Title: Nemo
// Author: Mr Toffee
// Video: https://www.youtube.com/watch?v=Zwn9UVQdY04
// Source: https://sudokupad.app/muytgcj0ni

// Normal sudoku rules apply. Three branching (tree-shaped) thermometers: along
// each, digits do not decrease while moving away from the bulb. Each entry
// below is a non-branching segment directed from a bulb or branch junction
// toward a tip; a segment that starts mid-tree shares its first cell with an
// earlier segment's junction, so that shared edge is not double-listed.
const slowThermoSegments = [
  // Thermometer 1, bulb R5C4.
  ['R5C4', 'R4C4', 'R4C5', 'R5C5', 'R6C4'],
  ['R5C4', 'R5C3', 'R4C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R4C3', 'R3C4', 'R3C5', 'R2C4', 'R1C3'],

  // Thermometer 2, bulb R5C8.
  ['R5C8', 'R4C8', 'R4C7', 'R5C7'],
  ['R4C8', 'R3C7', 'R3C6', 'R2C5'],
  ['R5C8', 'R6C8', 'R7C9'],
  ['R6C8', 'R7C8', 'R8C7', 'R9C6'],
  ['R8C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3', 'R6C3', 'R7C2'],
  ['R8C5', 'R9C4'],

  // Thermometer 3, bulb R7C6.
  ['R7C6', 'R7C7'],
  ['R7C6', 'R7C5'],
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
