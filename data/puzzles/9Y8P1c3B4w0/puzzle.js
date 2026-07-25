// Title: Thermomodness
// Author: Keaton Asbach
// Video: https://www.youtube.com/watch?v=9Y8P1c3B4w0
// Source: https://sudokupad.app/wi9so8t7xa

// Normal sudoku rules apply. Every thermometer below is a `Thermo` (strictly
// increasing from the bulb, listed first in each array). Each thermometer
// also needs its digit sum to be a multiple of its own length; ISS has no
// built-in class for that. A length-2 thermometer's sum-is-a-multiple-of-2
// rule is just "same parity", so it is a two-cell `Pair`. Longer
// thermometers use a per-thermometer NFA that tracks the running sum modulo
// the thermometer's length and accepts only when that remainder is 0 at the
// end (state = sum mod length, 0..length-1).

const THERMOS = [
  ['R9C3', 'R9C2', 'R8C1', 'R7C1', 'R8C2', 'R7C2'],
  ['R5C1', 'R5C2', 'R4C1'],
  ['R3C1', 'R2C1'],
  ['R1C2', 'R1C1', 'R2C2', 'R3C2'],
  ['R2C4', 'R3C3', 'R2C3'],
  ['R1C9', 'R1C8', 'R2C8'],
  ['R3C8', 'R2C9', 'R3C9'],
  ['R4C6', 'R5C6', 'R5C5', 'R6C6'],
  ['R6C5', 'R5C4', 'R4C5', 'R3C5', 'R4C4', 'R3C4', 'R4C3', 'R5C3'],
  ['R4C7', 'R3C6', 'R3C7'],
  ['R4C8', 'R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['R6C9', 'R5C9'],
  ['R8C9', 'R7C8', 'R7C9'],
  ['R9C7', 'R8C8', 'R9C8', 'R8C7'],
  ['R8C6', 'R8C5'],
  ['R9C5', 'R8C4', 'R7C5'],
  ['R7C4', 'R6C4', 'R6C3'],
];

const longThermos = THERMOS.filter(cells => cells.length > 2);
const pairThermos = THERMOS.filter(cells => cells.length === 2);

// One encoded spec per distinct thermometer length (3+), reused across
// same-length thermometers.
const sumModSpecs = new Map();
const sumModSpec = (length) => {
  if (!sumModSpecs.has(length)) {
    sumModSpecs.set(length, NFA.encodeSpec({
      startState: 0,
      transition: (state, value) => (state + value) % length,
      accept: (state) => state === 0,
    }, 9));
  }
  return sumModSpecs.get(length);
};

// Sum of a 2-cell thermometer is a multiple of 2 iff both digits share
// parity.
const parityKey = Pair.fnToKey((a, b) => (a + b) % 2 === 0, 9);

return [
  new Shape('9x9'),

  ...THERMOS.map(cells => new Thermo(...cells)),
  // Each per-thermometer constraint below gets its own unique name so that
  // two independent thermometers are never combined into one constraint.
  ...longThermos.map(
    (cells, i) => new NFA(sumModSpec(cells.length), `sum-mod-${i + 1}`, ...cells)),
  ...pairThermos.map(
    (cells, i) => new Pair(parityKey, `sum-mod-pair-${i + 1}`, ...cells)),
];
