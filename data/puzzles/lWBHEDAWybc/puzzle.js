// Title: Cool S(udoku)
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=lWBHEDAWybc
// Source: https://sudokupad.app/jiz9k1fcdl

// Standard Sudoku, the two givens, orange Dutch Whispers, pink Renbans,
// bulb-first dark-grey slow thermometers, and the drawn non-negative white dot.

// Drawn orange paths.
const whispers = [
  ['R5C3', 'R4C3', 'R3C2', 'R4C1', 'R5C1', 'R6C2', 'R7C2'],
  ['R4C2', 'R5C2', 'R6C3', 'R7C3', 'R8C2', 'R7C1', 'R6C1'],
  ['R1C1', 'R2C2'],
  ['R1C9', 'R2C8'],
  ['R1C7', 'R2C6', 'R1C6'],
  ['R1C3', 'R2C4', 'R1C4'],
  ['R9C3', 'R9C4', 'R8C4'],
  ['R8C6', 'R9C6', 'R9C7'],
].map(cells => new Whisper(4, ...cells));

// Drawn pink paths.
const renbans = [
  new Renban('R5C6', 'R4C6', 'R3C5', 'R4C4', 'R5C4', 'R6C5', 'R7C5'),
  new Renban('R4C5', 'R5C5', 'R6C6', 'R7C6', 'R8C5', 'R7C4', 'R6C4'),
];

// Drawn dark-grey paths, starting at the circular bulbs. Thermo enforces a
// strictly increasing sequence; there is no native nondecreasing ("slow")
// thermometer class, so this stays a hand-keyed Pair chain.
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);
const slowThermos = [
  ['R5C9', 'R4C9', 'R3C8', 'R4C7', 'R5C7', 'R6C8', 'R7C8'],
  ['R6C7', 'R7C7', 'R8C8', 'R7C9', 'R6C9', 'R5C8', 'R4C8'],
].map(cells => new Pair(slowThermoKey, 'Slow Thermometer (nondecreasing)', ...cells));

return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R9C8', 1),
  ...whispers,
  ...renbans,
  ...slowThermos,
  // The drawn white dot; the rules explicitly say not all such dots are given.
  new WhiteDot('R8C5', 'R9C5'),
];
