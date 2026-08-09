// Title: SVS 375: Odd-Even Thermometer
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=bM2cjAxj86Y
// Source: https://app.crackingthecryptic.com/sudoku/MhJfjH7nLr

// Full encoding. Standard sudoku (default row/col/box groups; no givens).
// Fifteen thermometers: digits strictly increase from the bulb (Thermo), and
// every cell on one thermometer shares the same parity, independently per
// thermometer (a same-parity Pair over each thermometer's own cell path).

const geometry = cellGraph('9x9').gridGeometry();

// Thermometers, bulb cell first -- from the drawn line paths (lightgray,
// thickness 12) and each line's bulb-circle overlay, which sits on the first
// cell listed here in every case.
const thermometers = [
  ['R1C1', 'R1C2'],
  ['R3C1', 'R4C2', 'R4C3', 'R5C4'],
  ['R6C2', 'R5C2'],
  ['R6C3', 'R5C3'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R8C4', 'R8C3', 'R9C3'],
  ['R8C7', 'R8C6', 'R7C6'],
  ['R6C5', 'R5C5'],
  ['R6C6', 'R5C6', 'R4C7'],
  ['R3C7', 'R4C6', 'R4C5'],
  ['R2C5', 'R3C6'],
  ['R2C7', 'R1C6'],
  ['R2C8', 'R1C9'],
  ['R3C9', 'R4C9'],
  ['R8C9', 'R9C9'],
];
const thermoConstraints = thermometers.map(cells => new Thermo(...cells));

// Same-parity relation between two digits, applied by Pair to every
// consecutive pair within a thermometer's own cell list -- so all cells on
// one thermometer end up mutually same-parity, independently per line.
const sameParityKey = Pair.fnToKey((a, b) => (a % 2) === (b % 2), geometry.numValues);
const parityConstraints = thermometers.map(cells =>
  new Pair(sameParityKey, 'thermo-parity', ...cells));

return [
  new Shape('9x9'),
  ...thermoConstraints,
  ...parityConstraints,
];
