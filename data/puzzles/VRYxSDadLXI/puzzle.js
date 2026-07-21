// Title: Spring Has Sprung
// Author: Blobz
// Video: https://www.youtube.com/watch?v=VRYxSDadLXI
// Source: https://sudokupad.app/blobz/spring-has-sprung

// Digits do not decrease as they move away from each thermometer bulb.
const slowThermos = [
  [
    'R5C6', 'R6C7', 'R7C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3',
    'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C3', 'R1C4',
  ],
  [
    'R5C4', 'R4C3', 'R3C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7',
    'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C7', 'R9C6',
  ],
  ['R8C8', 'R9C8', 'R9C9', 'R8C9'],
  ['R2C2', 'R1C2', 'R1C1', 'R2C1'],
  ['R8C2', 'R9C2', 'R9C1', 'R8C1'],
  ['R1C9', 'R1C8', 'R2C8', 'R2C9'],
];
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),
  ...slowThermos.map(cells =>
    new Pair(slowThermoKey, 'Slow Thermometer', ...cells)),
];
