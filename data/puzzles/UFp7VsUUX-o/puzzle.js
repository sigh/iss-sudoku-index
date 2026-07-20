// Title: The Archer's Dozen
// Author: Bartok the Magnificent
// Video: https://www.youtube.com/watch?v=UFp7VsUUX-o
// Source: https://sudokupad.app/n8gezvtat5

// Each downward ray is either a German whisper or a non-decreasing slow
// thermometer. Each upward ray has a single, solver-determined parity.

const downwardRays = [
  ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
];

const upwardRays = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R9C8', 'R8C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3', 'R3C2', 'R2C1'],
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R8C9', 'R7C8', 'R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R1C2'],
];

const nonDecreasingKey = Pair.fnToKey((a, b) => a <= b, 9);
const sameParityKey = Pair.fnToKey((a, b) => (a - b) % 2 === 0, 9);

const downwardRules = downwardRays.map(cells => new Or([
  new Whisper(5, ...cells),
  new Pair(nonDecreasingKey, 'Slow thermometer', ...cells),
]));

const upwardRules = upwardRays.map(cells =>
  new Pair(sameParityKey, 'Same parity', ...cells));

return [
  new Shape('9x9'),
  ...downwardRules,
  ...upwardRules,
];
