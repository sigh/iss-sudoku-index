// Title: Four At A Time
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=9LDrEYKa-aQ
// Source: https://sudokupad.app/868i586sml

// A slow thermometer is monotonic away from its bulb. Since each bulb is
// invisible, either orientation of each complete line is allowed.
const lines = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C3', 'R6C2', 'R7C1'],
  ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'],
];
const nondecreasing = Pair.fnToKey((a, b) => a <= b, 9);

const slowThermos = lines.map(cells => new Or([
  new Pair(nondecreasing, 'Slow thermo', ...cells),
  new Pair(nondecreasing, 'Slow thermo', ...cells.toReversed()),
]));

return [
  new Shape('9x9'),
  new Given('R2C1', 4),
  new Given('R6C7', 4),
  new Given('R7C2', 9),
  new Given('R9C7', 5),
  ...slowThermos,
];
