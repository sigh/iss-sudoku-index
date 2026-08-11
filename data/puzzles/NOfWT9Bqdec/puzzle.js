// Title: No. 1
// Author: Dian Raubenheimer
// Video: https://www.youtube.com/watch?v=NOfWT9Bqdec
// Source: https://app.crackingthecryptic.com/sudoku/Fjt3rLqG2r

// Normal sudoku (default 3x3 boxes) with one given. Six two-cell
// thermometers (grey capsules, filled circle marks the bulb end) require the
// bulb cell to be less than its other cell. X marks between orthogonally
// adjacent cells sum to 10, V marks sum to 5; every possible X and V is
// marked, so StrictXV forbids the sum on every unmarked adjacent pair.

const given = new Given('R3C2', 1);

// Thermometers: [bulb, other]. Bulb cell identified by the drawn grey
// circle overlay coincident with one line endpoint (verified per-line,
// not assumed from waypoint order).
const thermos = [
  ['R1C4', 'R1C3'],
  ['R1C5', 'R1C6'],
  ['R2C8', 'R1C8'],
  ['R3C8', 'R3C9'],
  ['R5C8', 'R6C8'],
  ['R6C5', 'R5C5'],
];

// X marks (sum to 10), transcribed from the drawn edge overlays.
const xPairs = [
  ['R1C7', 'R2C7'],
  ['R1C6', 'R2C6'],
  ['R3C4', 'R3C5'],
  ['R4C4', 'R5C4'],
  ['R5C3', 'R5C4'],
  ['R5C3', 'R6C3'],
  ['R4C1', 'R4C2'],
  ['R9C1', 'R9C2'],
  ['R9C7', 'R9C8'],
  ['R8C9', 'R9C9'],
  ['R6C8', 'R7C8'],
  ['R5C8', 'R5C9'],
  ['R6C6', 'R7C6'],
  ['R7C5', 'R8C5'],
  ['R6C4', 'R6C5'],
  ['R1C4', 'R1C5'],
];

// V marks (sum to 5), transcribed from the drawn edge overlays.
const vPairs = [
  ['R7C2', 'R7C3'],
  ['R8C8', 'R9C8'],
  ['R4C7', 'R4C8'],
  ['R3C7', 'R4C7'],
  ['R2C5', 'R3C5'],
];

return [
  new Shape('9x9'),
  given,
  ...thermos.map(([bulb, other]) => new Thermo(bulb, other)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  ...vPairs.map(([a, b]) => new V(a, b)),
  new StrictXV(),
];
