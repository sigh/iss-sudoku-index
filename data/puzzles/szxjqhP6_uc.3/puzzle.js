// Title: Sep 7, 2022: Thermo Killer
// Author: Sham Capplemon-Limes
// Video: https://www.youtube.com/watch?v=szxjqhP6_uc
// Source: https://tinyurl.com/4uvmepmy

// Normal sudoku. Digits in a killer cage do not repeat and sum to the
// cage's total. Digits along a thermometer strictly increase from the bulb
// (first-listed cell) to the tip.

const GIVENS = [
  ['R2C2', 1], ['R2C5', 2], ['R2C8', 3],
  ['R4C1', 8], ['R4C9', 3],
  ['R5C2', 4], ['R5C5', 5], ['R5C8', 6],
  ['R6C1', 3], ['R6C9', 8],
  ['R8C2', 7], ['R8C5', 8], ['R8C8', 9],
];
const givens = GIVENS.map(([cell, digit]) => new Given(cell, digit));

// Killer cages: cells and totals from the drawn cage outlines.
const CAGES = [
  [21, ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R4C3']],
  [22, ['R6C7', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9']],
  [15, ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5']],
  [16, ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9']],
];
const cages = CAGES.map(([total, cells]) => new Cage(total, ...cells));

// Thermometers: bulb cell listed first, per the drawn bulb end.
const THERMOS = [
  ['R1C2', 'R1C1'],
  ['R1C4', 'R1C3'],
  ['R1C6', 'R1C5'],
  ['R1C9', 'R1C8'],
  ['R9C8', 'R9C9'],
  ['R9C6', 'R9C7'],
  ['R9C4', 'R9C5'],
  ['R3C7', 'R3C8'],
  ['R3C9', 'R4C9'],
  ['R2C6', 'R3C6'],
  ['R8C4', 'R7C4'],
  ['R7C3', 'R7C2'],
  ['R7C1', 'R6C1'],
  ['R5C4', 'R5C5', 'R5C6'],
];
const thermos = THERMOS.map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...thermos,
];
