// Title: Sep 6, 2022: Killer Thermo
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=szxjqhP6_uc
// Source: https://tinyurl.com/4h8b94mz

// Normal sudoku rules apply. Digits on each thermometer strictly increase
// from the bulb; Thermo enforces exactly that, bulb-first. Digits in each
// killer cage sum to the given total and cannot repeat; Cage enforces both.

// Thermometer cell lists, bulb-first; transcribed from the payload's
// `thermometer` entries.
const thermos = [
  ['R4C3', 'R3C3', 'R2C3', 'R1C3', 'R1C2', 'R1C1'],
  ['R6C7', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'],
];

// Killer cages [total, cells...]; transcribed from the payload's
// `killercage` entries.
const cages = [
  [11, 'R1C1', 'R1C2'],
  [13, 'R1C3', 'R1C4'],
  [8, 'R1C5', 'R1C6'],
  [5, 'R1C8', 'R1C9'],
  [10, 'R2C6', 'R3C6'],
  [13, 'R3C7', 'R3C8'],
  [11, 'R3C9', 'R4C9'],
  [8, 'R5C4', 'R5C5', 'R5C6'],
  [10, 'R6C1', 'R7C1'],
  [11, 'R7C2', 'R7C3'],
  [9, 'R7C4', 'R8C4'],
  [4, 'R9C1', 'R9C2'],
  [6, 'R9C4', 'R9C5'],
  [14, 'R9C6', 'R9C7'],
  [13, 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
