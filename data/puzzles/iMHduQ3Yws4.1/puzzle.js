// Title: June 16, 2023: Thermo Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=iMHduQ3Yws4
// Source: https://tinyurl.com/2aupp5vf

// Normal sudoku rules, plus: digits along each thermometer strictly increase
// starting from the round bulb (Thermo's own semantics), and digits in each
// killer cage sum to the printed total with no repeat within the cage
// (Cage's own semantics).

// Thermometers (4 cells each), bulb-first cell order - from `thermometer[].lines`.
const THERMOS = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R3C9', 'R3C8', 'R3C7', 'R3C6'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6'],
  ['R9C9', 'R9C8', 'R9C7', 'R9C6'],
];

// Killer cages: [total, cells] - from `killercage[]`.
const CAGES = [
  [7, ['R1C3', 'R1C4']],
  [9, ['R4C3', 'R4C4']],
  [11, ['R7C3', 'R7C4']],
  [8, ['R3C6', 'R3C7']],
  [10, ['R6C6', 'R6C7']],
  [12, ['R9C6', 'R9C7']],
  [11, ['R1C7', 'R1C8']],
  [13, ['R4C7', 'R4C8']],
  [15, ['R7C7', 'R7C8']],
  [11, ['R2C2', 'R2C3']],
  [13, ['R5C2', 'R5C3']],
  [15, ['R8C2', 'R8C3']],
];

return [
  new Shape('9x9'),

  ...THERMOS.map((cells) => new Thermo(...cells)),
  ...CAGES.map(([total, cells]) => new Cage(total, ...cells)),
];
