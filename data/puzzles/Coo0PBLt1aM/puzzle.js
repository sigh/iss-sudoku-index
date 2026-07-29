// Title: Siphonophorae
// Author: voldemortensen
// Video: https://www.youtube.com/watch?v=Coo0PBLt1aM
// Source: https://sudokupad.app/imh93gfugq

// Normal sudoku rules apply. Along each pale-blue slow thermometer, digits
// do not decrease from its circle-marked bulb towards every tip; equal
// consecutive digits are allowed. The arrays are the drawn line strokes,
// transcribed bulb-to-tip. The first eight share bulb R1C4 and form one
// branching thermometer; the ninth has bulb R5C5.
const slowThermoSegments = [
  ['R1C4', 'R2C4', 'R3C4', 'R4C5', 'R5C6', 'R5C7', 'R6C8', 'R7C9', 'R8C9'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C5', 'R5C4', 'R6C4', 'R7C4'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C5', 'R5C4', 'R6C4', 'R7C5', 'R8C6'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C3', 'R5C3', 'R6C2', 'R7C1', 'R8C1', 'R9C1'],
  ['R1C4', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C1'],
  ['R1C4', 'R2C4', 'R3C5', 'R3C6', 'R4C7', 'R5C8'],
  ['R1C4', 'R2C4', 'R3C5', 'R3C6', 'R2C7', 'R3C7'],
  ['R1C4', 'R2C4', 'R3C5', 'R2C6'],
  ['R5C5', 'R6C6', 'R7C7', 'R8C7', 'R9C7'],
];

// A custom Pair key represents the slow-thermo relation a <= b.
const nondecreasingKey = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),
  ...slowThermoSegments.map(cells => new Pair(
    nondecreasingKey,
    'Slow Thermometer',
    ...cells,
  )),
];
