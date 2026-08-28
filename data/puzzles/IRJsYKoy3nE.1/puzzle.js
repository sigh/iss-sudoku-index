// Title: May 3, 2022: Consec. Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=IRJsYKoy3nE
// Source: https://tinyurl.com/2k3pyhye

// Normal sudoku rules apply (enforced by Shape). Digits along each
// thermometer must increase CONSECUTIVELY from the round bulb to the tip
// (e.g. 3 4 5 6 is allowed, 3 4 5 7 is not). ISS's native Thermo only
// enforces strictly increasing, not a step of exactly 1, so each
// thermometer is instead a Pair chain with a "next = prev + 1" predicate.
// Pair binds consecutive cells by array position (bulb-to-tip order, per
// the f-puzzles thermometer.lines convention), so one Pair per thermo
// applies the step check to every bulb-to-tip edge in sequence.

const consecUp = Pair.fnToKey((a, b) => b === a + 1, 9);

// Thermometers, transcribed bulb-to-tip from the drawn lines.
const THERMOS = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
  ['R4C9', 'R3C8', 'R2C7', 'R1C6'],
  ['R2C9', 'R1C8'],
  ['R2C1', 'R1C2'],
  ['R9C4', 'R8C3', 'R7C2', 'R6C1'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R9C2', 'R8C1'],
  ['R9C8', 'R8C9'],
  ['R4C7', 'R3C6', 'R2C5'],
  ['R6C3', 'R7C4', 'R8C5'],
  ['R5C3', 'R4C4'],
  ['R5C7', 'R6C6'],
];

return [
  new Shape('9x9'),

  // Givens, from the drawn grid.
  new Given('R1C1', 5),
  new Given('R1C5', 7),
  new Given('R1C9', 4),
  new Given('R9C1', 8),
  new Given('R9C5', 4),
  new Given('R9C9', 7),

  ...THERMOS.map(
    (cells, i) => new Pair(consecUp, `thermo${i}`, ...cells)),
];
